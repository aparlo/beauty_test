var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var model = require('./models.js');
var url = 'mongodb://macbot.local:27017/testing-new';
var db = mongoose.connect(url);
var app = express();
const multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({storage: storage})

// var uslugi = require('./uslugi.json')

// mongoose.connect();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  store: new MongoStore({url:url}),
  secret: 'keyboard cat',
  cookie: { maxAge: 60000000 }
  }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// function(req, res, next){
//   model.Uslugi.find(function(err, uslugi){
//     res.locals.uslugi = uslugi
//     next()
//   })
// }

app.use('/', function(req, res, next){
  model.Uslugi.find(function(err, uslugi){
    res.locals.uslugi = uslugi
    next()
  })
})


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
  model.User.find(function(err, docs) {
    res.render('index', {masters: docs});
  })
});

app.get('/filter/:usluga', function(req, res){
  var usluga = req.params.usluga
  console.log('Выбрана' + usluga)
  model.Uslugi.findOne({_id:usluga}, function(err, usluga){
    model.User.find({"uslugi.cat":usluga.id}, function(err, docs) {
      console.log(docs.username + usluga)
      res.render('index', {masters: docs});
    })
  })
});

// SignUp
app.get('/signin', function(req, res, next) {
  res.render('signin')
})

app.get('/register', function(req, res, next){
  res.render('register')
})

app.post('/register', upload.single('avatar'), function(req, res, next) {
  var uslugi = Array.prototype.slice.call(req.body.uslugi)
  console.log(uslugi);
  var User = new model.User
  User.username = req.body.username
  User.password = req.body.password
  User.FirstName = req.body.FirstName
  User.LastName = req.body.LastName
  User.PhoneNumber = req.body.PhoneNumber
  User.Email = req.body.Email
  User.role = req.body.role
  User.about =  req.body.about
  User.status = 'active'
  User.uslugi = uslugi
  User.city = req.body.city
  User.save()
  db.close
  next()
});

app.get('/jqtest', function(req, res, next){
  res.render('jqtest')
})

/* Edit registered users */
app.post('/register/:id', function(req, res) {
  console.log(req.body)
  var userid = req.params.id;
  model.User.findById(userid, function(err, docs) {
    docs.username = req.body.username;
    docs.password = req.body.password;
    docs.role = req.body.role;
    docs.FirstName = req.body.FirstName;
    docs.LastName = req.body.LastName;
    docs.PhoneNumber = req.body.PhoneNumber;
    docs.Email = req.body.Email;
    docs.about = req.body.about;
    docs.save(function(err, uDocs){
      console.log(uDocs);
      res.redirect('/users');
    });
  });
});

app.get('/users', function(req, res, next){
  console.log('users')
  model.User.find(function(err, docs) {
    res.render('users', {users: docs});
  })
});

/* PUT Edit page. */
// app.post('/edit/:id', function(req, res) {
//   var userid = req.params.id;
//   model.Names.findById(userid, function(err, docs) {
//     docs.FirstName = req.body.First;
//     docs.LastName = req.body.Last;
//     docs.Sex = req.body.Sex;
//     docs.save(function(err, uDocs){
//       res.redirect('/names');
//     });
//   });
// });

app.post('/new_order', loadUser, function(req, res) {
  var NewOrder = new model.Order({
      OrderName: req.body.OrderName,
      OrderCustomer: req.session.user,
  });
  NewOrder.save(function(err, uDocs){
    console.log(uDocs);
    res.redirect('/dashboard');
  });
});

/* MasteVote. */
app.post('/master_vote/:mastername.:orderid', function(req, res) {
  model.Order.findByIdAndUpdate(
    req.params.orderid,
    {$addToSet: {OrderVotes:req.params.mastername}},
    {safe: true, upsert: true},
    function(err, order_vote){
      console.log('New Vote');
      res.redirect('/dashboard');
    }
  )
});

/* ClientVote. */
app.post('/client_vote/:mastername.:orderid', function(req, res) {
  model.Order.findByIdAndUpdate(
    req.params.orderid,
    {$set: {OrderMaster:req.params.mastername, OrderStatus:'in_progress'}},
    {safe: true, upsert: true},
    function(err, order_vote){
      console.log('Mater Vote');
      res.redirect('/dashboard', {OrderStatus:'in_progress'});
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
      // console.log(docs);
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
