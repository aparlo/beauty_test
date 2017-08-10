var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
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
  'uslugi': [],
  'rating': Number,
  'city': String
});

var uslugiSchema = new mongoose.Schema({
  'cat': String,
  'subcat': []
})

var orderSchema = new mongoose.Schema({
  'OrderName': {type: String, requires: true},
  'OrderCustomer': String,
  'OrderVotes': [], //сюда помещается предложения исполнителей как объекты.
  'OrderStatus': {type:String, default:'new'},
  'OrderMaster': String
});
module.exports.Names = mongoose.model('Names', {
  'FirstName': {type: String, required: true},
  'LastName': String
});


module.exports.User = mongoose.model('User', userSchema);
module.exports.Order = mongoose.model('Order', orderSchema);
module.exports.Uslugi = mongoose.model('Uslugi', uslugiSchema, 'uslugi');
