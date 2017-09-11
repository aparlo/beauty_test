var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var catSchema = new Schema({
  'name':String,
  'sub_cat': [{type: Schema.Types.ObjectId, ref:'Uslugi'}],
  '_sort': Number
})

// var sub_catSchema = new Schema({
//   'name': String,
//   'cat': {type: Schema.Types.ObjectId, ref:'Cat'}
// })

var master_uslugiSchema = new Schema({
  'name': {type: Schema.Types.ObjectId, ref:'Uslugi'},
  'sub_cat': [{type: Schema.Types.ObjectId, ref:'Cat'}]
})

var uslugiSchema = new Schema({
  'name': String,
  'cat': {type: Schema.Types.ObjectId, ref:'Cat'}
})

var userSchema = new Schema({
  'date_registered': {type: Date, default: Date.now}
  'username': {type: String, required: true, index: {unique:true}},
  'password': {type: String, required: true},
  'FirstName': {type: String},
  'LastName': {type: String},
  'PhoneNumber': {type: String},
  'Email': String,
  'role': {type: String, required: true},
  'status':['active', 'blocked', 'vip'],
  'about': String,
  'avatar': { data: Buffer, contentType: String },
  'uslugi': [master_uslugiSchema],
  'rating': Number,
  'city': String,
  'portfolio': [],
  'Reviews': [],
  'peresvon': Number,
  'go_out': Boolean
})

var orderSchema = new Schema({
  'OrderName': {type: String, requires: true},
  'OrderDate': {type: String, requires: true},
  'OrderCustomer': String,
  'OrderVotes': [], //сюда помещается предложения исполнителей как объекты.
  'OrderStatus': {type:String, default:'new'},
  'OrderMaster': String
})

module.exports.Names = mongoose.model('Names', {
  'FirstName': {type: String, required: true},
  'LastName': String
})


module.exports.User = mongoose.model('User', userSchema)
module.exports.Order = mongoose.model('Order', orderSchema)
module.exports.Uslugi = mongoose.model('Uslugi', uslugiSchema, 'uslugi')
module.exports.MasterUslugi = mongoose.model('MasterUslugi', master_uslugiSchema)
module.exports.Cat = mongoose.model('Cat', catSchema, 'categories')
