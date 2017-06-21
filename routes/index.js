var express = require('express');
var router = express.Router();


router.use(bodyParser.urlencoded({ extended: true }));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST Show page. */
router.post('/show', function(req, res, next) {
  var First = req.body.First;
  res.render('show', { Header1: First });
});

/* GET Show page. */
router.get('/show', function(req, res, next) {
  res.render('show', { Header1: First });
});
module.exports = router;
