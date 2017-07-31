var express = require('express'); // express 모듈 사용하기 위함
var app = express();
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

    console.log("router.get : " + errMsg);

    if (errMsg) msg = errMsg;
    res.render('login.ejs', {'message' : msg});
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {

        console.log("email : " + email);
        console.log("password : " + password);

        connection.query('select * from user where email=?', [email], function (err, rows) {

            if (err) return done(err);

            if (rows.length) {
                console.log("rows[0].uid : " + rows[0].uid);
                return done(null, { 'email' : email, 'id' : rows[0].uid });
            }
            else {
                return done(null, false, {'message' : 'Your login info is not found'});
            }
        })
    }
));


router.post('/', function(req, res, next) {

    passport.authenticate('local-login', function(err, user, info) {
        if (err) res.status(500).json(err); // 500 : Server Error
        if (!user) return res.status(401).json(info.message); // 401 : 권한없음

        req.logIn(user, function(err) {

            console.log("logIn!!");

            if (err) {
                console.log("Login. reqIn err");
                return next(err);
            }

            return res.json(user);
        });

    }) (req, res, next);

});


module.exports = router;