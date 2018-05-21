var express = require("express");
var app = express();
app.use(express.static("./public"));
app.set("view engine","ejs");
app.set("views","./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT || 3000);
var listUser = [""];
var listGame = [];

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
	// tic-tac-game
	socket.on("client-create-game", function(){
		console.log(socket.id + " create-room");
		listRoom.push([socket.id]);
		io.sockets.emit("server-created-room");
	});
	socket.on("client-found-game", function(){
		var i = 0, l = listGame.length;
		while(listGame[i] && listGame[i].length != 1){
			i++;
		}
		if(i < l){
			listGame[i].push(socket.id);
			io.sockets.emit("server-found-player");
			console.log(socket.id + " vs " + listGame[i][0]);
			listGame[i].isX = Math.floor((Math.random() * 2) + 1) == 1 ? listGame[i][0] : listGame[i][1];
			listGame[i].pX = 0;
			listGame[i].pO = 0;
			listGame[i].arr = [
			    [0, 0, 0, 0],
			    [0, 0, 0, 0],
			    [0, 0, 0, 0],
			    [0, 0, 0, 0]
			];
			listGame[i].lastPick = socket.id;
			if(socket.id == listGame[i].isX){
				io.to(socket.id).emit("server-send-isX", {isX: 1, idGame: i});
				io.to(listGame[i][0]).emit("server-send-isX", {isX: 0, idGame: i});
			}
			else{
				io.to(socket.id).emit("server-send-isX", {isX: 1, idGame: i});
				io.to(listGame[i][0]).emit("server-send-isX", {isX: 0, idGame: i});
			} 
		}else{
			listGame.push([socket.id]);
			io.sockets.emit("server-created-room");
		}
	});
	socket.on("client-want-pick", function(data){
		var y = data.position % 10;
		var x = (data.position - y) / 10;
		var opp = listGame[data.idGame][0] == socket.id ? 1 : 0;
		console.log(data.idGame + " | " + data.position);
		if (listGame[data.idGame].arr[x][y] == 0 && listGame[data.idGame].lastPick != socket.id) {
		    if (listGame[data.idGame].isX == socket.id) {
		        listGame[data.idGame].arr[x][y] = 1;
		        io.to(socket.id).emit("server-accept-pick", {position: data.position, value: data.isX});
		        io.to(listGame[data.idGame][opp]).emit("server-accept-pick", {position: data.position, value: data.isX});
		    } else {
		        listGame[data.idGame].arr[x][y] = 2;
		        io.to(socket.id).emit("server-accept-pick", {position: data.position, value: data.isX});
		        io.to(listGame[data.idGame][opp]).emit("server-accept-pick", {position: data.position, value: data.isX});
		    }
		    console.log(listGame[data.idGame].arr);
		    if (isWin(data.idGame)){
		    	listGame[data.idGame].arr = [
				    [0, 0, 0, 0],
				    [0, 0, 0, 0],
				    [0, 0, 0, 0],
				    [0, 0, 0, 0]
				];
		    	if(data.isX == 1) listGame[data.idGame].pX++;
		    	else listGame[data.idGame].pO++;
		    	console.log(socket.id + " win!!!");
		    	io.to(socket.id).emit("server-send-winResult");
		    	io.to(listGame[data.idGame][opp]).emit("server-send-loseResult");
		    }
		    else {
		        if (isDraw(data.idGame)){
		        	console.log(" Draw!!!");
		        	listGame[data.idGame].arr = [
					    [0, 0, 0, 0],
					    [0, 0, 0, 0],
					    [0, 0, 0, 0],
					    [0, 0, 0, 0]
					];
		        	io.to(listGame[data.idGame][0]).emit("server-send-drawResult");
		        	io.to(listGame[data.idGame][1]).emit("server-send-drawResult");
		        }
		    }
		    listGame[data.idGame].lastPick = socket.id;
		}
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

app.get("/game", function(req, res){
	res.render("tic-tac-game");
});

function isWin(idGame) {
	console.log("Call is wwin " + idGame);
	var arr = listGame[idGame].arr;
    if (arr[1][1] !== 0 && arr[1][2] == arr[1][1] && arr[1][3] == arr[1][1]) return true;
    else if (arr[2][1] !== 0 && arr[2][2] == arr[2][1] && arr[2][3] == arr[2][1]) return true;
    else if (arr[3][1] !== 0 && arr[3][2] == arr[3][1] && arr[3][3] == arr[3][1]) return true;
    else if (arr[1][1] !== 0 && arr[2][1] == arr[1][1] && arr[3][1] == arr[1][1]) return true;
    else if (arr[1][2] !== 0 && arr[2][2] == arr[1][2] && arr[3][2] == arr[1][2]) return true;
    else if (arr[1][3] !== 0 && arr[2][3] == arr[1][3] && arr[3][3] == arr[1][3]) return true;
    else if (arr[2][2] !== 0 && arr[1][1] == arr[2][2] && arr[3][3] == arr[2][2]) return true;
    else if (arr[2][2] !== 0 && arr[1][3] == arr[2][2] && arr[3][1] == arr[2][2]) return true;
    else return false;
}

function isDraw(idGame) {
	console.log("Call is draw " + idGame);
	var arr = listGame[idGame].arr;
    var count = 0;
    if (!isWin(idGame)) {
        for (var k = 1; k <= 3; k++) {
            for (var l = 1; l <= 3; l++) {
                if (arr[k][l] !== 0) count++;
            }
        }
        if (count == 9) return true;
        else return 0;
    }
}