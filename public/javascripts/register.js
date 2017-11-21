$(document).ready(function(){
  $("input.child").on("change", function(){
    var par = $(this).closest("ul").siblings(".parent")
    var n = $(this).closest("ul").find("input:checked").length
    var sib = $(this).closest("li").find("#sprice")
    if ( $(this).prop('checked') == true) {
      sib.attr("hidden", false)
    }
    else {
      console.log(sib)
      sib.attr('hidden', true)
    }

    if (n > 0){
      par.attr("checked", true)
    }
    else {
      par.attr("checked", false)
    }
  });
});

$(document).ready(function(){
  $('input.selall').on('change', function(){
    var sib = $(this).next("ul").find("li .child")
    if ($(this).prop('checked') == true){
      sib.prop('checked', true)
    }
    else{
      sib.prop('checked', false)
    }
  })
})

$(document).ready(function(){
  $("select").on("change", function(){
    var city = $("#city option:selected").text();
    if (city == "Воронеж") {
      $("#my_region").show()
    }
    else {
      $("#my_region").hide()
    }
  })
});
