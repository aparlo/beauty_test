var express = require('express')
var socket_io    = require("socket.io")
var request = require('request');
var https = require('https');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var mongoose = require('mongoose')
var model = require('./models.js')
var url = 'mongodb://localhost:27017/testing-new'
var db = mongoose.connect(url)
var app = express()
var fs = require('fs')
const multer = require('multer')

var nodemailer = require('nodemailer')
var io = socket_io()
app.io = io

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var path = './public/images/uploads/' + req.session.user.username
    fs.stat(path, function(err, stat){
      if (err) {
        console.log('Folder is not exist')
        fs.mkdir(path)
      }
      else if (!stat.isDirectory()){
        console.log('Is not a folder')
      }
      else{
        console.log('Folder exist')
      }
    })
    cb(null, path)
  },
  filename: function (req, file, cb) {
    cb(null, req.session.user.username + file.originalname)
  }
})

var upload_dir = multer({storage: storage})
var cpUpload = upload_dir.fields([{name:'images', maxCount:3}])


//test sms_token
var sms_token = 'a7042f981e8f5c3c9b9120c9a1c3b19f017892e97393aff66e27035c503af2643271b5dc2f43a4f83017266587d6916a004a4b82a39b9764209ef563558207d7'

function Send_sms_reg(phone, msg) {
  var uri = 'https://api.smsworldhub.com/v1/send?'+'token='+sms_token+'&phone='+phone+'&mes=Для продолжения регистрации на сайте thetopmasters.ru, введите код: 1124'
  var options = { method: 'GET',
    url: 'https://api.smsworldhub.com/v1/send',
    qs:
     { token: 'a7042f981e8f5c3c9b9120c9a1c3b19f017892e97393aff66e27035c503af2643271b5dc2f43a4f83017266587d6916a004a4b82a39b9764209ef563558207d7',
       phone: phone,
       mes: 'Для продолжения регистрации на сайте thetopmasters.ru, введите код:'+msg },
    headers:
     { 'postman-token': '7b8fa2d5-22f4-9d8e-33cb-e8f337e2b0b1',
       'cache-control': 'no-cache' } };
  request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
})
}


// setup email data with unicode symbols
let mailOptions = {
    from: '"Fred Foo 👻" <info@thetopmasters.ru>', // sender address
    to: 'aparlo@icloud.com, parlobox@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
}

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.yandex.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'aparlo',
        pass: '2ba31'
    }
})

// send mail with defined transport object
// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message %s sent: %s', info.messageId, info.response);
// });

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

function genPass(req, res, next) {
  var chars = "abcdefghijklmnopqrstuvwxyz1234567890";
  var pass = "";
  for (var x = 0; x < 3; x++) {
      var i = Math.floor(Math.random() * chars.length);
      pass += chars.charAt(i);
  }
  req.password = '111';
  console.log(pass);
  Send_sms_reg(req.body.PhoneNumber, req.password)
  next()
}
function genNumber(req, res, next) {
  var chars = "ABCDEFGHIJKLMNOP";
  var nums = "1234567890"
  var number = "";
  for (var x = 0; x < 3; x++) {
      var i = Math.floor(Math.random() * chars.length);
      number += chars.charAt(i);
  }
  number += '-'
  for (var x = 0; x < 4; x++) {
      var i = Math.floor(Math.random() * nums.length);
      number += nums.charAt(i);
  }
  req.number = number;
  console.log('Order number is: ' + number);
  next()
}

function loginUser(req, res, next) {
  model.User.findOne({username: req.body.username}, function(err, user){
    if(!user) {
      res.render('login', {error: 'No username found'});
    } else{
      if (req.body.password === user.password) {
        req.session.user = user;
        console.log('Session: ' + req.session.user.username + ',' + req.session.user.role);
        next();
      } else {
        res.render('login', {error: 'Wrong Password'});
      }
    }
    });
};

function loadUser(req, res, next){
  console.log('Verifing session...')
  console.log(req.session.id);
  if (req.session && req.session.id && req.session.user){
    model.User.findOne({username: req.session.user.username}, function(err, user){
      if(!user) {
        req.session.destroy();
        res.redirect('/login');
      } else {
        res.locals.Ses = {user:user, SesStatus:true};
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

app.use('/', function(req, res, next){
  model.Cat.find()
  .populate('sub_cat')
  .sort({'name':1})
  .exec(function(err, uslugi) {
    res.locals.uslugi = uslugi
    next()
  })
})

app.get('/upload', loadUser, function(req, res){
  res.render('upload')
})

function AddPortfolio(req, res, next){
  var img_path = req.files.images[0].path.replace('public', '')
  console.log(img_path)
  model.User.update({_id:req.session.user._id}, 
    {$addToSet: {portfolio: img_path}},
    {safe: true, upsert: true}).exec()
  next()
}

app.post('/file_upload', cpUpload, AddPortfolio, function(req, res, next){
  res.send('OK').status(200)
  res.end()
})

app.get('/send_sms', function(req, res) {
  Send_sms('89204049343', '111')
  res.send('send_sms')
})

//Uslugi Show, Edit, Add
app.get('/uslugi', function(req, res, next){
  res.render('uslugi')
})

app.post('/uslugi_newcat', function(req, res, next){
  console.log(req.body);
  Cat = new model.Cat({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.cat
  })
  Cat.save()
  res.redirect('/uslugi')
})

app.post('/uslugi_add', function(req, res, next){
  console.log(req.body);
  Usluga = new model.Uslugi
  Usluga._id = new mongoose.Types.ObjectId()
  Usluga.name = req.body.name
  Usluga.cat = req.body.cat
  Usluga.save(function(err){
    if (err) console.log(err);
    console.log(Usluga._id);
    model.Cat.update({_id: req.body.cat}, {$addToSet: {sub_cat:Usluga._id}}).exec()
  })
  res.redirect('/uslugi')
})


app.get('/', function(req, res){
  res.render('index', {title:'Найти мастера или сделать заказ'})
})

app.get('/master_card:_id', function(req, res){
  model.User.findOne({_id:req.params._id}).populate({
    path:'uslugi.name',
    select:'name',
    model:'Cat'
  }).exec(function(err, docs){
    model.User.populate(docs, {
      path:'uslugi.sub_cat',
      model:'Uslugi'
    }, function(err, docs) {
      console.log(docs);
          return res.send(docs)
    })
  })
})


//Filter
app.get('/catalog:usluga', function(req, res){
  var usluga = req.params.usluga
  console.log('Выбрана' + usluga)
  model.Uslugi.findOne({_id:usluga}, function(err, usluga){
    model.User.find({"uslugi.cat":usluga.id}, function(err, docs) {
      console.log(docs.username + '' + usluga)
      res.render('catalog', {masters: docs});
    })
  })
});


app.get('/catalog', function(req, res){
    model.User
    .find({'role':'master'})
    .populate({
      path:'uslugi.name',
      select:'name',
      model:'Cat'
      })
    .sort('uslugi.sub_cat')
    .exec(function(err, docs) {
      model.User.populate(docs, {
          path:'uslugi.sub_cat',
          model:'Uslugi'
        }, function(err, docs) {
          res.render('catalog', {masters: docs});
        })
  })
});


// SignUp
app.get('/signin', function(req, res, next) {
  res.render('signin')
})


//Login
app.post('/login', loginUser, function(req, res){
  res.redirect('/dashboard');
});


app.get('/login', function(req, res, next){
  res.locals.User = req.session;
  res.render('login');
});


app.get('/logout', function(req, res, next){
  req.session.destroy();
  res.redirect('/');
});


//Register
app.get('/register', function(req, res, next){
  res.render('register')
})


app.get('/date',  function(req, res, next){
  res.render('date')
})


app.post('/date', function(req, res, next){
  console.log(req.body)
})

app.post('/register_order', genPass, genNumber, function(req, res, next) {
  var User = new model.User
  User._id = new mongoose.Types.ObjectId()
  User.password = req.password
  User.username = req.body.Email
  User.FirstName = req.body.FirstName
  User.LastName = req.body.LastName
  User.PhoneNumber = req.body.PhoneNumber
  User.Email = req.body.Email
  User.role = 'client'
  User.status = 'blocked'
  User.order_status = 'active'
  User.save(function(err, client){
    if (err) console.log(err)
    var Order = new model.Order
    Order.name = req.body.OrderName
    Order.number = req.number
    Order.date_desire = req.body.OrderDate
    Order.time_desire = req.body.OrderTime
    Order.customer = User._id
    Order.place = req.body.place
    Order.address.city = req.body.city
    Order.address.district = req.body.district
    Order.status = 'new'
    Order.save(function(err, order){
      if (err) console.log(err)
      return res.send(User)
    })
  })
})


app.post('/register', cpUpload, genPass, function(req, res, next) {
  console.log(req.body.username);
  var uslugi = Array.prototype.slice.call(req.body.uslugi)
  var User = new model.User
  User.username = req.body.Email
  User.password = req.password
  User.FirstName = req.body.FirstName
  User.LastName = req.body.LastName
  User.PhoneNumber = req.body.PhoneNumber
  User.Email = req.body.Email
  User.role = 'master'
  User.about =  req.body.about
  User.status = 'active'
  User.uslugi = uslugi
  User.address.city = req.body.city
  User.go_out = req.body.go_out
  User.save(function (err, master) {
    if (err) console.log(err)
    console.log('registered')
  })
  db.close
  res.redirect('/login')
});


// Edit registered users
app.post('/register/:id', function(req, res) {
  var uslugi = Array.prototype.slice.call(req.body.uslugi)
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


//Show Users
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



//Orders
app.post('/new_order', genNumber, loadUser, function(req, res) {
  var Order = new model.Order
  Order.name = req.body.OrderName
  Order.number = req.number
  Order.date_desire = req.body.OrderDate
  Order.time_desire = req.body.OrderTime
  Order.customer = res.locals.Ses.user.id
  Order.place = req.body.place
  Order.address.city = req.body.city
  Order.address.district = req.body.district
  Order.status = 'new'
  Order.save(function(err, order){
    if (err) console.log(err)
    return res.send('200')
  })
});

/* MasteVote. */
app.post('/master_vote/:mastername.:orderid', function(req, res) {
  model.Order.findByIdAndUpdate(
    req.params.orderid,
    {$addToSet: {votes:{master:req.params.mastername, price:req.body.price}}},
    {safe: true, upsert: true},
    function(err, order_vote){
      if (err) console.log(err);
      res.redirect('/dashboard')
    }
  )
});


/* ClientVote. */
app.post('/client_vote/:mastername.:orderid', function(req, res) {
  console.log(req.body.price);
  model.Order.findByIdAndUpdate(
    req.params.orderid,
    {$addToSet: {master:req.params.mastername, status:'in_progress'}},
    {safe: true, upsert: true},
    function(err, order_vote){
      console.log('Mater Vote');
      ;
    }
  )
});


function changeDate(req, res, next){
  var date = new Date()
  date.setMonth(date.getMonth() + 1)
  req.newDate = date
  next()
}


//merchant
app.post('/payment_ok', loadUser, changeDate, function(req, res, next){
  console.log(req.session.user.username);
  console.log(req.newDate);
  model.User.findById(
    req.session.user._id, function(err, user){
      if (err) console.log(err);
      user.set({
        date_expire:req.newDate,
        merchant:{
          status:'bronze',
          transactions:{date:new Date, amount:'1000'}
        }})
      user.save(function(err, updatedDoc){
        if (err) console.log(err)
        console.log(updatedDoc);
      })
    }
  )
})


app.get('/session', loadUser, function(req, res, next){
  console.log(req.session.id);
  res.send(req.session.id + ' ' + req.session.user.role);
});

app.get('/dashboard', loadUser, function(req, res, next){
  console.log('Dashboard!')
  if (req.session.user.role == 'client') {
    model.Order
    .find({customer:req.session.user._id})
    .populate('name customer votes.master')
    .exec(function(err, docs){
      res.render('dashboard', {orders:docs});
      })
  } else if (req.session.user.role == 'master'){
    console.log('User is master!');
    model.Order
    .find({})
    .populate('name customer')
    .exec(function(err, docs){
      res.render('dashboard', {callb:'Новый заказ', orders:docs});
    })
  }
});

app.get('/socket_test', function(req, res, next){
 res.render('socket_test')

})

var getResult = function(num){
  result = num + 2
  console.log('Get result: ' + result)
}

io.on('connection', function(socket) {
    console.log(socket + '  Client connected...');

    socket.on('join', function(data) {
    })
    
    socket.on('get_result', function(data){
      getResult(data)
    })

    socket.on('querry', function(data){
      console.log(data)
      model.User
      .find({username:{$regex: ".*" + data+ ".*"}})
      .exec(function(err, user){
        console.log(user)
        socket.emit('result', user)
      })
    })
})

//Statics
app.get('/contacts', function(req, res, next){
  res.render('contacts')
})

app.get('/masteram', function(req, res, next){
  res.render('masteram')
})

app.get('/offert', function(req, res, next){
  res.render('offert')
})

app.get('/partneram', function(req, res, next){
  res.render('partneram')
})

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
