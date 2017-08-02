var express = require('express'); // express 모듈 사용하기 위함
var app = express(); // express 모듈을 app이라는 변수명으로 사용
var bodyParser = require('body-parser'); // body-parser를 bodyParser란 변수로 사용
var router = require('./router/index');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;


app.listen(3000, function() {
    console.log("start!! express server port on 3000!!");
});

app.use(express.static('public'));
app.use(bodyParser.json()); // Json Parser
app.use(bodyParser.urlencoded({ extended:true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(router);




