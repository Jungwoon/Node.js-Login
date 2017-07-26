var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

var main = require('./main/main');
var email = require('./email/email');
var join = require('./join/index');
var login = require('./login/index');
var logout = require('./logout/index');

// '/'로 들어오면 /public/main.html을 열어준다.
router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, "../public/main.html"));
});

router.use('/main', main);
router.use('/email', email);
router.use('/join', join);
router.use('/login', login);
router.use('/logout', logout);

module.exports = router;