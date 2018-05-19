var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var path = require('path');
app.use(express.static(path.resolve('./public')));

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});
var listUser = [];

var listObjUser = [];


io.on('connection', function(client) {

    var total = io.engine.clientsCount;
    client.emit('getCount', "Toàn hệ thống đang có: " + total + "đang online");
    io.sockets.emit('getCount', "Toàn hệ thống đang có: " + total + "đang online");
    client.emit('broadcast',
        "Chào mừng các bạn đã đến với trò chơi chat trực tuyến của 24/7");

    Object.keys(io.engine.clients)
    client.emit('broad', client.id);

    client.on('join', function(data) {
        var total_increase = io.engine.clientsCount;
        listUser = Object.keys(io.engine.clients);
        var temLstUserToBroadCast = [];
        temLstUserToBroadCast = listUser.filter(x => x != client.id);
        client.broadcast.emit('listUser', listUser);
        client.emit('AllUser', temLstUserToBroadCast);
    });

    client.on('submit_Email', email => {
        if (listObjUser.length > 0) {
            var checkExist = listObjUser.find(x => x.Email == email);
            if (!checkExist) {
                listObjUser.push({ Email: email, SocketId: client.id });
            }
        } else {
            listObjUser.push({ Email: email, SocketId: client.id });
        }
        console.log(listObjUser);
        client.emit('resendEmailToClient', listObjUser => {});
    });


    client.on('messages', function(data) {});


    client.on('disconnect', function() {
        console.log('client :' + client.id + "đã ngắt kết nối");

        var total_decrease = io.engine.clientsCount;

        listUser = Object.keys(io.engine.clients);

        client.broadcast.emit('listUser', listUser);

        client.broadcast.emit('getCount', "Toàn hệ thống đang có: " + total_decrease + "đang online");

        client.broadcast.emit('ban_be_vua_offline', client.id);
    });



    client.on('ChatWithFriend', function(data) {
        console.log("bạn " + client.id + "muốn chat vs bạn " + data);
        io.sockets.in(data).emit("chat-phan-hoi", "bạn " + client.id + "muốn chat vs bạn ");
    });

    client.on('send-messages-group', function(data) {
        client.broadcast.emit('phan-hoi-messages-group', client.id + ": " + data);
    });


    client.on('send-msg-from-client-to', function(id, msg) {
        io.sockets.in(id).emit("respone-msg-from-server-to-client",
            client.id, msg);
    });

    //client.broadcast.to(client.i).emit('message', 'for your eyes only');

});
server.listen(process.env.PORT || 5000);