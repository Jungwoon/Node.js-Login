var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// DATABASE SETTING (Google Cloud SQL)
var connection = mysql.createConnection({
    host     : '104.154.161.83',
    port     : 3306,
    user     : 'root',
    password : 'root',
    database : 'jsman'
});

connection.connect();

// Routing
router.get('/', function(req, res) {
    var msg;
    var errMsg = req.flash('error');

    if (errMsg) msg = errMsg;

    res.render('join.ejs', {'message' : msg});
});

passport.serializeUser(function(user, done) {
    console.log('passport session save : ', user.id);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('passport session get id : ', id);
    done(null, id);
});


passport.use('local-join', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        var query = connection.query('select * from user where email=?', [email], function (err, rows) {
            if (err) {
                console.log('something wrong');
                return done(err);
            }

            if (rows.length) {
                console.log('existed user');
                return done(null, false, {message: 'your email is already used'});
            }
            else {
                console.log('no existed user');
                var sql = {email: email, pw: password};
                var query = connection.query('insert into user set ?', sql, function (err, rows) {
                   if (err) throw err
                    return done(null, { 'email' : email, 'id' : rows.insertId });
                });
            }
        })
    }
));

// 성공했을때 리다이렉트 시키는 부분
router.post('/', passport.authenticate('local-join', {
    successRedirect: '/main',
    failureRedirect: '/join',
    failureFlash: true
}));

// router.post('/', function (req, res) {
//     var body = req.body;
//     var email = body.email;
//     var name = body.name;
//     var passwd = body.password;
//
//     var sql = { email : email, name : name, pw : passwd }
//
//     var query = connection.query('insert into user set ?', sql, function (err, rows) {
//         if (err) { throw err; }
//         console.log("DB inserted : ", rows.insertId, name)
//
//         res.render('welcome.ejs', { 'name' : name, 'id' : rows.insertId });
//     });
// });

module.exports = router;