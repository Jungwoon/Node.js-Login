var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

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
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

// 성공했을때 리다이렉트 시키는 부분
router.post('/', passport.authenticate('join-local', {
    successRedirect: '/main',
    failureRedirect: '/join',
    failureFlash: true
}));

passport.use('join-local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {

        connection.query('select * from user where email=?', [email], function (err, rows) {
            if (err) { return done(err); }

            if (rows.length) {
                return done(null, false, {message: 'your email is already used'});
            }
            else {
                bcrypt.hash(password, null, null, function(err, hash) {
                    var sql = {email: email, password: hash};
                    connection.query('insert into user set ?', sql, function (err, rows) {
                        if (err) throw err;
                        return done(null, { 'email' : email, 'id' : rows.insertId });
                    });
                });
            }
        })
    }
));

module.exports = router;