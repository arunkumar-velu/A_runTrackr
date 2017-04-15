$('.message a').click(function(){
   $('.form div').animate({height: "toggle", opacity: "toggle"}, "slow");
   $("input").val('');
   $(".error").addClass("hide");
});

$('#signUp').click(function(){
	var name = $(".register-form input[name=name]").val();
	var email = $(".register-form input[name=email]").val();
	var password = $(".register-form input[name=password]").val();
	var val = {name: name,email: email, password: password};
    $.ajax({
      method: "POST",
      dataType:"json",
      contentType: "application/json; charset=utf-8",
      url: "/users",
      data: JSON.stringify(val)
    })
    .done(function( result ) {
    	$('.form div').animate({height: "toggle", opacity: "toggle"}, "slow");
	}).fail(function(err){
		$(".register-form .error").removeClass("hide");
	});
});

$("#login").click(function(){
	var email = $(".login-form input[name=email]").val();
	var password = $(".login-form input[name=password]").val();
	var val = {email: email, password: password};
    $.ajax({
      method: "POST",
      dataType:"json",
      contentType: "application/json; charset=utf-8",
      url: "/sign_in",
      data: JSON.stringify(val)
    })
    .done(function( result ) {
    	window.location = "/"; 
	}).fail(function(err){
		$(".login-form .error").html(err.responseJSON.data);
		$(".login-form .error").removeClass("hide");
	});
});

