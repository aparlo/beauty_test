$(function () {

  'use strict';

//   var $date = $('.docs-date');
//   var $container = $('.docs-datepicker-container');
//   var $trigger = $('.docs-datepicker-trigger');
//   var options = {
//     show: function (e) {
//       console.log(e.type, e.namespace);
//     },
//     hide: function (e) {
//       console.log(e.type, e.namespace);
//     },
//     pick: function (e) {
//       console.log(e.type, e.namespace, e.view);
//     },
//     language: 'ru-RU'
//   };

//   $date.on({
//     'show.datepicker': function (e) {
//       console.log(e.type, e.namespace);
//     },
//     'hide.datepicker': function (e) {
//       console.log(e.type, e.namespace);
//     },
//     'pick.datepicker': function (e) {
//       console.log(e.type, e.namespace, e.view);
//     }
//   }).datepicker(options);

//   $('.docs-options, .docs-toggles').on('change', function (e) {
//     var target = e.target;
//     var $target = $(target);
//     var name = $target.attr('name');
//     var value = target.type === 'checkbox' ? target.checked : $target.val();
//     var $optionContainer;

//     switch (name) {
//       case 'container':
//         if (value) {
//           value = $container;
//           $container.show();
//         } else {
//           $container.hide();
//         }

//         break;

//       case 'trigger':
//         if (value) {
//           value = $trigger;
//           $trigger.prop('disabled', false);
//         } else {
//           $trigger.prop('disabled', true);
//         }

//         break;

//       case 'inline':
//         $optionContainer = $('input[name="container"]');

//         if (!$optionContainer.prop('checked')) {
//           $optionContainer.click();
//         }

//         break;

//       case 'language':
//         $('input[name="format"]').val($.fn.datepicker.languages[value].format);
//         break;
//     }

//     options[name] = value;
//     $date.datepicker('reset').datepicker('destroy').datepicker(options);
//   });

//   $('.docs-actions').on('click', 'button', function (e) {
//     var data = $(this).data();
//     var args = data.arguments || [];
//     var result;

//     e.stopPropagation();

//     if (data.method) {
//       if (data.source) {
//         $date.datepicker(data.method, $(data.source).val());
//       } else {
//         result = $date.datepicker(data.method, args[0], args[1], args[2]);

//         if (result && data.target) {
//           $(data.target).val(result);
//         }
//       }
//     }
//   });

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

//New orders

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

$(document).ready(function(orders_new){
  $("#orders .submit").click(function(){
    $(this).closest("form")
      .submit(function(event){
        event.preventDefault()
        var action = $(this).attr('action')
        // result = action.replace(/(.+\/.+\.)(.+)/g, '$2')
        // console.log(result)
        // socket.emit('new_master_vote', result)
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

// reset password
function changePassword(id){
  console.log(id)
  $.ajax({
    url: '/reset_password',
    type: 'POST',
    success: function(result){
      UIkit.modal.alert('Новый пароль был выслан вам в СМС')
    }
  })
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