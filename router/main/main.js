var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

router.get('/', function(req, res) {
    var id = req.user;

    if (!id) {
        res.render('main.ejs');
    }
    else {
        res.render('main.ejs', { data: id } );
    }

});

module.exports = router;