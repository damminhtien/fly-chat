var socket = io("http://localhost:3000/");
var idGame = "";
var isX = "";
var pX = 0, pO = 0;

$(document).ready(function() {
    socket.emit("client-found-game");
    $("#maingame").hide();
    $("#nextround").hide();
    $("#Xwin").hide();
    $("#Owin").hide();
    $("#draw").hide();
});

socket.on("server-found-player", function(){
    $("#maingame").fadeIn(1600);
    $("#waitView").fadeOut(1600);
});

socket.on("server-send-isX", function(data){
    idGame = data.idGame;
    isX = data.isX;
    if(isX == 1) $("#XorO").html("You are X in game " + idGame);
    else $("#XorO").html("You are O in game " + idGame);
});

socket.on("server-accept-pick", function(data){
    if(data.value == 1) $("#"+data.position).html("X");
    else $("#"+data.position).html("O");
});

socket.on("server-send-winResult", function(data){
    win(isX == 1);
});

socket.on("server-send-loseResult", function(data){
    win(isX != 1);
});

socket.on("server-send-drawResult", function(data){
    draw();
});

function replay() {
    arr = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    pX = 0;
    pO = 0;
    document.getElementById("pointx").innerHTML = "Player X : " + pX;
    document.getElementById("pointo").innerHTML = "Player O : " + pO;
    $('td').empty();
    $("#nextround").hide();
    $("#maingame").hide(1000);
    $("#XorO").hide(1000);
    $("#selectmode").show(1500);
}

function isWin() {
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

function win(booln) {
    if (booln) {
        $("#Xwin").show(2500);
        $("#Xwin").hide(2500);
        pX++;
        document.getElementById("pointx").innerHTML = "Player X : " + pX;
    } else {
        $("#Owin").show(2500);
        $("#Owin").hide(2500);
        pO++;
        document.getElementById("pointo").innerHTML = "Player O : " + pO;
    }
    $("#maingame").hide(800);
    $("#nextround").show(2500);
    $("#maingame").show(800);
}

function nextround() {
    $("#maingame").fadeOut(1600);
    $("#nextround").hide(2000);
    $("#maingame").fadeIn(1600);
    arr = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    $("td").empty();
}


function isDraw() {
    var count = 0;
    if (!isWin()) {
        for (var k = 1; k <= 3; k++) {
            for (var l = 1; l <= 3; l++) {
                if (arr[k][l] !== 0) count++;
            }
        }
        if (count == 9) return true;
        else return 0;
    }
}

function draw() {
    $("#draw").show(2000);
    $("#draw").hide(2500);
    nextround();
}

function play(but) {
    socket.emit("client-want-pick", {idGame: idGame, position: but.id, isX: isX});
}

// function comProcess(x, y) {
//     var x = 0,
//         y = 0;
//     if (isX) comsign = 2;
//     else comsign = 1;
//     //computer picked?
//     var picked = false;
//     //traversal rows 
//     for (var i = 1; i <= 3; i++) {
//         if (!picked && arr[i][1] !== 0 && arr[i][2] == arr[i][1] && arr[i][3] === 0) {
//             picked = true;
//             x = i;
//             y = 3
//         }
//         if (!picked && arr[i][1] !== 0 && arr[i][3] == arr[i][1] && arr[i][2] === 0) {
//             picked = true;
//             x = i;
//             y = 2;
//         }
//         if (!picked && arr[i][2] !== 0 && arr[i][2] == arr[i][3] && arr[i][1] === 0) {
//             picked = true;
//             x = i;
//             y = 1;
//         }
//     }
//     //traversal col
//     // if comp didn't pick
//     if (!picked) {
//         for (var j = 1; j <= 3; j++) {
//             if (!picked && arr[1][j] !== 0 && arr[1][j] == arr[2][j] && arr[3][j] === 0) {
//                 picked = true;
//                 x = 3;
//                 y = j;
//             }
//             if (!picked && arr[1][j] !== 0 && arr[1][j] == arr[3][j] && arr[2][j] === 0) {
//                 picked = true;
//                 x = 2;
//                 y = j;
//             }
//             if (!picked && arr[2][j] !== 0 && arr[2][j] == arr[3][j] && arr[1][j] === 0) {
//                 picked = true;
//                 x = 1;
//                 y = j;
//             }
//         }
//     }
//     //traversal diagonal
//     if (!picked) {
//         if (!picked && arr[1][1] !== 0 && arr[1][1] == arr[2][2] && arr[3][3] === 0) {
//             picked = true;
//             x = 3;
//             y = 3;
//         }
//         if (!picked && arr[1][1] !== 0 && arr[1][1] == arr[3][3] && arr[2][2] === 0) {
//             picked = true;
//             x = 2;
//             y = 2;
//         }
//         if (!picked && arr[2][2] !== 0 && arr[3][3] == arr[2][2] && arr[1][1] === 0) {
//             picked = true;
//             x = 1;
//             y = 1;
//         }
//         if (!picked && arr[2][2] !== 0 && arr[2][2] == arr[1][3] && arr[3][1] === 0) {
//             picked = true;
//             x = 3;
//             y = 1;
//         }
//         if (!picked && arr[2][2] !== 0 && arr[2][2] == arr[3][1] && arr[1][3] === 0) {
//             picked = true;
//             x = 1;
//             y = 3;
//         }
//         if (!picked && arr[1][3] !== 0 && arr[3][1] == arr[1][3] && arr[2][2] === 0) {
//             picked = true;
//             x = 2;
//             y = 2;
//         }
//     }
//     if (!picked && arr[2][2] === 0) {
//         picked = true;
//         x = 2;
//         y = 2;
//     }
//     if (!picked) {
//         for (var k = 1; k <= 3; k++) {
//             for (var l = 1; l <= 3; l++) {
//                 if (arr[k][l] === 0) {
//                     picked = true;
//                     x = k;
//                     y = l;
//                     break;
//                 }
//             }
//         }
//     }
//     if (picked) {
//         arr[x][y] = comsign;
//         if (isX) {
//             document.getElementById((x * 10 + y).toString()).innerHTML = "O";
//         } else {
//             document.getElementById((x * 10 + y).toString()).innerHTML = "X";
//         }
//     }
//     if (isWin()) win(!isX);
//     if (isDraw()) draw();
// }