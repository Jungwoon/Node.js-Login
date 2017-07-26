var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

module.exports = router;