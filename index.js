var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var path = require('path');
app.use(express.static(path.resolve('./public')));

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});
io.on('connection', function (client) {
    var total = io.engine.clientsCount;

    client.emit('getCount', "Toàn hệ thống đang có: " + total + "đang online");
    io.sockets.emit('getCount', "Toàn hệ thống đang có: " + total + "đang online");


    console.log(client.id + " đã kết nối!");
    console.log(client.UserName + " đã kết nối!");
    
    client.emit('broadcast',
        "Chào mừng các bạn đã đến với trò chơi chat trực tuyến của 24/7");
    
    var listUser = [];
    Object.keys(io.engine.clients)
    listUser = client.emit('broad', client.id);

    client.on('join', function (data) {
        var total_increase = io.engine.clientsCount;
      //  client.broadcast.emit('getCount', "Toàn hệ thống đang có: " + total_increase + "đang online");
        listUser = Object.keys(io.engine.clients);
        var index = listUser.indexOf(client.id);
        console.log(client.id);
        console.log(index);

        if (index > -1) {
            listUser.splice(index, 1);
        }
        client.broadcast.emit('listUser', listUser);
        client.broadcast.emit('ban_be_vua_online', client.id);

    });

    client.on('messages', function (data) {
    });


    client.on('disconnect', function () {
        console.log('client :' + client.id + "đã ngắt kết nối");
        var total_decrease = io.engine.clientsCount;
        listUser = Object.keys(io.engine.clients);

        var index = listUser.indexOf(client.id);
        console.log(client.id);
        console.log(index);

        if (index > -1) {
            listUser.splice(index, 1);
        }
        client.broadcast.emit('listUser', listUser);
       client.broadcast.emit('getCount', "Toàn hệ thống đang có: " + total_decrease + "đang online");
        client.broadcast.emit('ban_be_vua_offline', client.id);
    });



    client.on('ChatWithFriend', function (data) {
        console.log("bạn " + client.id + "muốn chat vs bạn " + data);
        io.sockets.in(data).emit("chat-phan-hoi","bạn " + client.id + "muốn chat vs bạn ");
    });
    client.on('send-messages-group', function (data) {
        client.broadcast.emit('phan-hoi-messages-group',client.id+ ": "+ data);
    });


    client.on('send-msg-from-client-to', function (id,msg) {
        io.sockets.in(id).emit("respone-msg-from-server-to-client",
        client.id,msg);
        
    });

    //client.broadcast.to(client.i).emit('message', 'for your eyes only');

});
server.listen(3000);  