$(function () {

  'use strict';



  $('[data-toggle="datepicker"]').datepicker({
    language: 'ru-RU',
    weekStart: 1
    });

});


//Index submit
$(document).ready(function(){
  $("#form")
    .submit(function(event){
      event.preventDefault()
      $.ajax({
          url: $("#form").attr('action'),
          type: 'POST',
          data: $("#form").serialize(),
          success: function(result) {
            alert('Ваш заказ зарегестрирован. Ожидайте СМС с паролем для входа в личный кабинет')
            UIkit.modal('#login_modal').show();
            $('#username').attr("value", result.username)

          }
      });
    })
});


//New order submit
$(document).ready(function(){
  $("#new_order")
    .submit(function(event){
      event.preventDefault()
      $.ajax({
          url: $("#new_order").attr('action'),
          type: 'POST',
          data: $("#new_order").serialize(),
          success: function(result) {
            alert('Ваш заказ зарегестрирован.')

          }
      });
    })
});

//Master vote
$(document).ready(function(orders_new){
  $("#orders .submit").click(function(){
    $(this).closest("form")
      .prop('hidden', true)
      .submit(function(event){
        event.preventDefault()
        var action = $(this).attr('action')
        $.ajax({
              url: $(this).attr('action'),
              type: 'POST',
              data: $(this).serialize(),
              success: function(result) {
                UIkit.modal.alert('Клиент получил ваш отклик. Ожидайте его решения.')
                $(document.body).html(result)
            }
        });
      })
  })
});


function show_master(id) {
  console.log(id);
  $.ajax({
    url: id,
    type: 'GET',
    success: function(result) {
      var muslugi = result.uslugi
      console.log(muslugi);
      jQuery.each(muslugi, function(i, val) {
        if (val){
          $('#master_card_data #uslugi')
            .append('<li>'+val.name.name+'</li>')
            .append('<ul>')
            jQuery.each(val.sub_cat, function(j, sval) {
              $('#master_card_data ul ul')
              .append('<li>' + sval.name +  '</li>')
          })
        }
        else {console.log('no value')}
      });
      $('#master_card_data').append('</ul>')
      $('#PhoneNumber').html(result.PhoneNumber)
    }
  })
  UIkit.modal('#' + id).show()
  $('#' + id).on('hide', function () {
    $('#master_card_data ul').empty()
  })
}

//reset password
function changePassword(id, object){
  console.log(id)
  var pass1 = $(object).siblings('input[name=new_password]').val()
  var pass2 = $(object).siblings('input[name=new_password_rep]').val()
  if (pass1 == pass2) {
    console.log(pass1)  
    $.ajax({
      url: '/reset_password/' + pass1,
      type: 'POST',
      success: function(result){
        UIkit.modal.alert('Вы изменили пароль. Он выслан вам в СМС')
    }
  })
  }
 
}

//Client vote
function ClientVote(order, master, object){
  $.ajax({
    url: '/client_vote/' + master + '.' + order,
    type: 'POST',
    success: function(result){
      UIkit.modal.alert('Спасибо! Мастер свяжется с вами в ближайшее время.')
      $(document.body).html(result)
    }
})
}

var i=0


function nextTab() {
    // here comes the function to click the next tab
  imgs = $('#sliders > #imgback').length
  console.log(imgs)
  // imgs = ['url(/images/industry.jpg)', 'url(/images/desk1.jpg)']
  UIkit.switcher('#sliders').show(i);
  console.log('nexttab'+i);
  if (i == (imgs - 1)){
    i=0
  } else{
    i++
  }
  // and here you call this function again
  setTimeout(nextTab, 10000);
}

$(document).ready(function(){
  setTimeout(nextTab, 0);
})

//Input mask
$(function(){
  $('#phone_input').mask('+7(999)999-9999')
})


//Sockets
var socket = io.connect();
socket.on('connect', function(data) {
  socket.emit('join', 'HeyHey');
})


$(document).ready(function(){
  $("#inp").keyup(function(e){
    var text = $(this).val()
    console.log()
    $("#send").submit()
  })
})


$(document).ready(function(){
  $('#send').submit(function(e){
    e.preventDefault()
    var data = $(this).find("input").val()
    socket.emit('querry', data)
  })
})

$(document).ready(function(){
  $(".get_result").click(function(e){
    console.log('Rusult clicked')
    socket.emit('get_result', 1)
  })

})

socket.on('result', function(data){
  $("#result").empty()
  if(data)
    $("#result").append("<ul>")
    jQuery.each(data, function(i, val){
      $("#result").append("<li>" + val.username + "</li>")
    })
   
})

$(document).ready(function(){
  var myform = $('#oplata_form')
  myform.submit(function(e){
    var form_data = this
    console.log('Found form')
    e.preventDefault()
    socket.emit('register_cart')
    socket.on('cart_registered', function(data){
      form_data.order.value = data._id
      pay(form_data); return false
    })
  })
})