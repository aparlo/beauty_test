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

var cartSchema = new Schema({
  'user': {type: Schema.Types.ObjectId, ref:'User' },
  'date': Date,
  'amount': Number
})

var uslugiSchema = new Schema({
  'name': String,
  'time_lapse': {type: Date},
  'price': {type: Number},
  'cat': {type: Schema.Types.ObjectId, ref:'Cat'}
})

var userSchema = new Schema({
  'date_registered': {type: Date, default: Date.now},
  'date_expire': {type: Date},
  'username': {type: String, required: true, index: {unique:true}},
  'password': {type: String},
  'FirstName': {type: String},
  'LastName': {type: String},
  'PhoneNumber': {type: String},
  'Email': String,
  'role': {type: String, required: true},
  'blocked':{type: Boolean, default:false},
  'about': String,
  'avatar': { data: Buffer, contentType: String },
  'uslugi': [master_uslugiSchema],
  'rating': [{
    likes:{type: Schema.Types.ObjectId, ref:'User'},
    dislikes:{type: Schema.Types.ObjectId, ref:'User'},
    rating:{type: Number}
    }],
  'address': {
    city: String,
    district: String},
  'portfolio': [],
  'Reviews': [],
  'call_back_time': Number,
  'go_out': Boolean,
  'merchant': {
    'status':String, //free, trial, bronze, silver, gold
    'transactions':[{
      date:{type: Date},
      amount:{type:Number}
    }],
    'date_expire': {type: Date}
  },
  'order_status': String,
  'orders_voted': [{
    order:{type: Schema.Types.ObjectId, ref:'Order'},
    price:{}
  }]
})

var orderSchema = new Schema({
  'name': {type: Schema.Types.ObjectId, ref:'Uslugi'},
  'number': {type: String},
  'date_desire': {type: Date},
  'time_desire': String,
  'address': {
    city: String,
    district: String},
  'date_registered': { type: Date, default: Date.now },
  'customer': {type: Schema.Types.ObjectId, ref:'User'},
  'votes': [{
    master: {type: Schema.Types.ObjectId, ref:'User'},
    price: Number,
    time: String,
    comments: [{
      user:{type: Schema.Types.ObjectId, ref: 'User'},
      message:{type:String}
    }]
}], //сюда помещается предложения исполнителей как объекты.
  'status': {type:String, default:'new'},
  'master': {type: Schema.Types.ObjectId, ref:'User'},
  'place': String
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
module.exports.Cart = mongoose.model('Cart', cartSchema)
