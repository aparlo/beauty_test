var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  'username': {type: String, required: true, index: {unique:true}},
  'password': {type: String, required: true},
  'role': {type: String, required: true}
});

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
