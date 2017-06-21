var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb'),
    assert = require('assert');
var mongoose = require('mongoose');
var url = 'mongodb://macbot.local:27017/testing';
db = mongoose.connect;
var fields;
var app = express();
// Connection URL

// // Use connect method to connect to the Server
// mongo.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected correctly to server");
//
//   db.close();
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// /* POST Show page. */
// app.post('/show', function(req, res, next) {
//   console.log('post');
//   var First = req.body.First;
//   mongo.connect(url, function(err, db) {
//     db.collection('Firsts').insertOne({
//       Name:First
//     });
//     db.close();
//   });
//   console.log('Inserted 1 document');
//   res.render('show', { Header1: First });
// });
//
// /* GET Show page. */
// app.get('/show', function(req, res, next) {
// console.log('GET');
//     mongo.connect(url, function(err,db) {
//     db.collection('Firsts').find().toArray(function(err, docs) {
//       assert.equal(err, null);
//       fields = docs;
//       db.close();
//     });
//   });
//   // console.log('Found the following:');
//   // console.log(fields);
//   res.render('show', { Header1: 'NOld', Fields: fields});
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
