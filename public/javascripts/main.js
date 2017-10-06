$(function () {

  'use strict';

  var $date = $('.docs-date');
  var $container = $('.docs-datepicker-container');
  var $trigger = $('.docs-datepicker-trigger');
  var options = {
    show: function (e) {
      console.log(e.type, e.namespace);
    },
    hide: function (e) {
      console.log(e.type, e.namespace);
    },
    pick: function (e) {
      console.log(e.type, e.namespace, e.view);
    }
  };

  $date.on({
    'show.datepicker': function (e) {
      console.log(e.type, e.namespace);
    },
    'hide.datepicker': function (e) {
      console.log(e.type, e.namespace);
    },
    'pick.datepicker': function (e) {
      console.log(e.type, e.namespace, e.view);
    }
  }).datepicker(options);

  $('.docs-options, .docs-toggles').on('change', function (e) {
    var target = e.target;
    var $target = $(target);
    var name = $target.attr('name');
    var value = target.type === 'checkbox' ? target.checked : $target.val();
    var $optionContainer;

    switch (name) {
      case 'container':
        if (value) {
          value = $container;
          $container.show();
        } else {
          $container.hide();
        }

        break;

      case 'trigger':
        if (value) {
          value = $trigger;
          $trigger.prop('disabled', false);
        } else {
          $trigger.prop('disabled', true);
        }

        break;

      case 'inline':
        $optionContainer = $('input[name="container"]');

        if (!$optionContainer.prop('checked')) {
          $optionContainer.click();
        }

        break;

      case 'language':
        $('input[name="format"]').val($.fn.datepicker.languages[value].format);
        break;
    }

    options[name] = value;
    $date.datepicker('reset').datepicker('destroy').datepicker(options);
  });

  $('.docs-actions').on('click', 'button', function (e) {
    var data = $(this).data();
    var args = data.arguments || [];
    var result;

    e.stopPropagation();

    if (data.method) {
      if (data.source) {
        $date.datepicker(data.method, $(data.source).val());
      } else {
        result = $date.datepicker(data.method, args[0], args[1], args[2]);

        if (result && data.target) {
          $(data.target).val(result);
        }
      }
    }
  });

  $('[data-toggle="datepicker"]').datepicker();

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
    $(this).html('Value')
    $(this).closest("form")
      .submit(function(event){
        event.preventDefault()
        var action = $(this).attr('action')
        console.log(action);
        console.log(orders.length);
        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: $(this).serialize(),
            success: function(result) {
              alert('Вы откликнулись на заказ')
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
        $('#master_card_data ul')
          .append('<li>'+val.name.name+'</li>')
          .append('<ul>')
          jQuery.each(val.sub_cat, function(j, sval) {
            $('#master_card_data ul ul')
            .append('<li>' + sval.name +  '</li>')
        })
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

var i=0


function nextTab() {
    // here comes the function to click the next tab
    imgs = ['url(/images/industry.jpg)', 'url(/images/desk1.jpg)']
    UIkit.switcher('#switch1').show(i);
    console.log('nexttab'+i);
    if (i == (imgs.length - 1)){
      i=0
    } else{
      i++
    }
    // and here you call this function again
    setTimeout(nextTab, 10000);
}
setTimeout(nextTab, 0);
