var express = require("express");
var app = express();
app.use(express.static("./public"));
app.set("view engine","ejs");
app.set("views","./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT || 3000);
var listUser = [""];

io.on("connection",function(socket){
	console.log("connected!!!" + socket.id);
	socket.on("client-register-name", function(name){
		console.log(name + " dang ky");
		if(listUser.indexOf(name) >= 0){
			socket.emit("server-cancel-register");
		}
		else{
			socket.name = name;
			listUser.push(name);
			socket.emit("server-accept-register", name);
			io.sockets.emit("server-send-listUser", listUser);
		}
	});
	socket.on("client-send-mess",function(mess){
		console.log(mess);
		io.sockets.emit("server-send-mess", {user:socket.name,mess:mess});
	});
	socket.on("client-logout", function(){
		console.log(socket.id + " logout");
		listUser.splice(listUser.indexOf(socket.name),1);
		io.sockets.emit("server-send-listUser", listUser);
	});
	socket.on("disconnect", function(){
		console.log(socket.id + " Ngat ket noi");
		listUser.splice(listUser.indexOf(socket.name),1);
		io.sockets.emit("server-send-listUser", listUser);
	});
});

app.get("/", function(req, res){
	res.render("trangchu");
});