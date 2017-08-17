var socket = io("http://localhost:3000/");

$(document).ready(function(){
	$("#chat-form").hide();

	$("#btnRegister").click(function(){
		var name = $("#textRegister").val();
		socket.emit("client-register-name", name);
	});
});



socket.on("server-cancel-register", function(){
	alert("Tên này đã có người dùng, bạn hãy thử tên khác nhé!!!");
	$("#textRegister").val() = "";
});

socket.on("server-accept-register", function(name){
	alert("Đăng ký thành công");
	$("#login-form").fadeOut(1000);
	$("#chat-form").fadeIn(2000);
	$("#userName").html(name);
});

socket.on("server-send-listUser", function(list) {
    $("#boxContent").html("");
    list.forEach(function(i){
    	$("#boxContent").append("<div>" + i + "</div>");
    });
});

socket.on("server-send-mess", function(data) {
    $("#ct").append("<p>" + data + "</p>");
});

$("#send").click(function() {
    var ct = $("#ta").val();
    socket.emit("client-send-mess", ct);
});