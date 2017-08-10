var express = require('express'); // express 모듈 사용하기 위함
var app = express();
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
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

    res.render('login.ejs', {'message' : msg}); // login.ejs 호출
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

passport.use('login-local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        connection.query('select * from user where email=?', [email], function (err, rows) {

            if (err) return done(err);

            if (rows.length) {
                bcrypt.compare(password, rows[0].password, function(err, res) {
                    if (res) {
                        return done(null, { 'email' : email, 'id' : rows[0].uid });
                    }
                    else {
                        return done(null, false, {'message' : 'Your password is incorrect'});
                    }
                });
            }
            else {
                return done(null, false, {'message' : 'Your login info is not found'});
            }
        })
    }
));

// for Kakao Auth
passport.use('login-kakao', new KakaoStrategy({
        clientID : 'b9a2a6b512bd31fcc10763cb83b83f7f',
        callbackURL : 'http://localhost:3000/login/oauth/kakao/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        return done(null, profile);
    }
));

router.post('/', function(req, res, next) {
    console.log('login local');
    passport.authenticate('login-local', function(err, user, info) {
        if (err) {
            res.status(500).json(err); // 500 : Server Error
        }

        if (!user) {
            return res.status(401).json(info.message); // 401 : 권한없음
        }

        req.logIn(user, function(err) {
            if (err) return next(err);

            return res.json(user);
        });
    }) (req, res, next);
});


router.get('/kakao', passport.authenticate('login-kakao'));
router.get('/oauth/kakao/callback', passport.authenticate('login-kakao', {
    successRedirect: '/main',
    failureRedirect: '/'
}));

module.exports = router;