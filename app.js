var express = require('express');
var session = require('express-session');
var Store = require('express-session').Store;
var MongooseStore = require('mongoose-express-session')('Store');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var model = require('./models.js');
var url = 'mongodb://macbot.local:27017/testing-new';
var db = mongoose.connect(url);
var app = express();

// mongoose.connect();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000000 }}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

function loginUser(req, res, next) {
  model.User.findOne({username: req.body.username}, function(err, user){
    if(!user) {
      res.render('login', {error: 'No username found'});
    } else{
      if (req.body.password === user.password) {
        req.session.user = user.username;
        req.session.userrole = user.role;
        console.log('Session: ' + req.session.user + ',' + req.session.userrole);
        next();
      } else {
        res.render('login', {error: 'Wrong Password'});
      }
    }
    });
};

function loadUser(req, res, next){
  console.log('Verifing session...');
  if (req.session && req.session.id){
    model.User.findOne({username: req.session.user}, function(err, user){
      if(!user) {
        req.session.destroy();
        res.redirect('/login');
      } else {
        res.locals.Ses = {username:user.username, userrole: user.role, SesStatus:true};
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};
app.get('/', function(req, res){
  console.log(req.session);
});


app.post('/register', function(req, res, next) {
  var User = new model.User({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role
  });
  console.log(User.username + '' + User.password);
  User.save();
  db.close;
  res.redirect('/users');
});

app.get('/users', function(req, res, next){
  model.User.find(function(err, docs) {
    res.render('users', {users: docs});
  })
});

/* PUT Edit page. */
app.post('/register/:id', function(req, res) {
  var userid = req.params.id;
  model.User.findById(userid, function(err, docs) {
    docs.username = req.body.username;
    docs.password = req.body.password;
    docs.role = req.body.role;
    docs.save(function(err, uDocs){
      console.log(uDocs);
      res.redirect('/users');
    });
  });
});

/* PUT Edit page. */
app.post('/edit/:id', function(req, res) {
  var userid = req.params.id;
  model.Names.findById(userid, function(err, docs) {
    docs.FirstName = req.body.First;
    docs.LastName = req.body.Last;
    docs.Sex = req.body.Sex;
    docs.save(function(err, uDocs){
      res.redirect('/names');
    });
  });
});

app.post('/new_order', loadUser, function(req, res) {
  var NewOrder = new model.Order({
    OrderName: req.body.OrderName,
    OrderCustomer: req.session.user,
    OrderStatus: true
  });
  NewOrder.save(function(err, uDocs){
    console.log(uDocs);
    res.redirect('/dashboard');
  });
});

/* PUT Edit page. */
app.post('/master_vote/:mastername.:orderid', function(req, res) {
  model.Order.findByIdAndUpdate(
    req.params.orderid,
    {$push: {OrderVotes:req.params.mastername}},
    {safe: true, upsert: true},
    function(err, order_vote){
      console.log('New Vote');
      res.redirect('/dashboard');
    }
  )
});

app.post('/login', loginUser, function(req, res){
  res.redirect('/dashboard');
});

app.get('/login', function(req, res, next){
  res.locals.User = req.session;
  res.render('login');
});

app.get('/logout', function(req, res, next){
  req.session.destroy;
  res.redirect('/login');
});

app.get('/session', loadUser, function(req, res, next){
  res.send(req.session.id + ' ' + req.session.userrole);
});

app.get('/dashboard', loadUser, function(req, res, next){
  console.log('Dashboard!')
  if (req.session.userrole == 'client') {
    console.log('User is cleint!');
    model.Order.find({OrderCustomer:req.session.user}, function(err, docs){
      console.log(docs);
      res.render('dashboard', {orders:docs});
    })
  } else if (req.session.userrole == 'master'){
    console.log('User is master!');
    model.Order.find({}, function(err, docs){
      console.log(docs);
      res.render('dashboard', {orders:docs});
    })
  }
});


/* GET Show page. */
app.get('/names', function(req, res, next) {
  model.Names.find(function (err, docs){
    res.render('show', {Fields: docs});
    db.close;
  });
});

// /* GET Edit page. */
// app.get('/edit/:id', function(req, res, next) {
//   var userid = req.params.id;
//   model.Names.findById(userid, function(err, docs) {
//     res.render('edit', {d:docs});
//     console.log(docs);
//   });
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

module.exports = app;
