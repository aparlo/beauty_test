$(document).ready(function(){
  $("input.child").on("change", function(){
    var par = $(this).closest("ul").siblings("input:checkbox")
    // if ($(this).is(":checked")){
    //   par.attr("checked", true)
    // }
    var par = $(this).closest("ul").siblings("input:checkbox")
    var n = $(this).closest("ul").find("input:checked").length
    var sib = $(this).closest("li").find("#sprice").attr("disabled", false)
    if (n > 0){
      par.attr("checked", true)
    }
    else {
      par.attr("checked", false)
    }
    console.log(n)
  });
});
