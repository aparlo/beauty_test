var url = 'mongodb://localhost:27017/testing-new'
var session = require('express-session')
var mongoose = require('mongoose')
var MongoStore = require('connect-mongo')(session)
 
//Session config
var sessionMiddleware = session({
    store: new MongoStore({url:url}),
    secret: 'keyboard cat',
    cookie: { maxAge: 60000000 }
    })
module.exports = {
    url: url,
    db: mongoose.connect(url),
    sessionMiddleware:sessionMiddleware
}