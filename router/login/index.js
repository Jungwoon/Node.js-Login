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

    console.log("router.get : " + errMsg);

    if (errMsg) {
        console.log("errMsg : " + errMsg);
        msg = errMsg;
    }

    console.log("call login.ejs and message : " + msg);
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
                console.log("login email : " + email);
                console.log("login password : " + password);
                console.log("login rows[0].password : " + rows[0].password);

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
// passport.use('login-kakao', new KakaoStrategy({
//         clientID : '8f110c83b0e6eb21a75785d7129ade26',
//         callbackURL : '/main'
//     },
//     function(accessToken, refreshToken, profile, done){
//
//         console.log("profile : " + profile._json);
//
//         // 사용자의 정보는 profile에 들어있다.
//         // User.findOrCreate(..., function(err, user) {
//         //     if (err) { return done(err); }
//         //     done(null, user);
//         // });
//     }
// ));


router.post('/', function(req, res, next) {

    console.log("login received to login");

    passport.authenticate('login-local', function(err, user, info) {

        console.log("in in in local-login");

        if (err) {
            console.log("inter error");
            res.status(500).json(err); // 500 : Server Error
        }


        if (!user) {
            console.log("!user");
            return res.status(401).json(info.message); // 401 : 권한없음
        }

        req.logIn(user, function(err) {

            console.log("logIn!!");

            if (err) {
                console.log("Login. reqIn err");
                return next(err);
            }

            return res.json(user);
        });

        console.log("done");

    }) (req, res, next);

});


module.exports = router;