var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();

router.get('/', function(req, res){
    req.logout();
    res.render('main.ejs', { isLogin: false });

    console.log("logout done");
});

module.exports = router;