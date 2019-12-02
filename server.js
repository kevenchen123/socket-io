'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const SUBINDEX = path.join(__dirname, 'chatroom2/index.html');

var app = express();
app.use(express.static(path.join(__dirname, 'chatroom2')));

var router = express.Router();
router.get('/', (req, res) => res.sendFile(INDEX));
router.get('/chatroom2', (req, res) => res.sendFile(SUBINDEX));

var api = require('./routes/api');
app.use('/api', api);

const server = app
  .use(router)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));

  chatroom(socket);
  chatroom2(socket);
});

setInterval(() => io.emit('time', (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString()), 1000);


//----------------------------chat room------------------------------

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

function chatroom(socket){
	console.log('chatroom a user connected');
	
	//监听新用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;
		
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}
		
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username+'加入了聊天室');
	});
	
	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			
			//删除
			delete onlineUsers[socket.name];
			//在线人数-1
			onlineCount--;
			
			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'退出了聊天室');
		}
	});
	
	//监听用户发布聊天内容
	socket.on('message', function(obj) {
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		//console.log(obj.username+'说：'+obj.content);
	});
}


//----------------------------chat room 2------------------------------

function chatroom2(socket) {
    console.log('chatroom2 a user connected');

    socket.emit('client-connected', {
        type : 'connected'
    });

    socket.on('client-join', data => {
        if(data.type === 'join') {
            socket.join(data.room);
            socket.room = data.room;

            socket.emit('system', {
                message : 'Hi ' + data.name + ', welcome to chat room'
            });

            socket.broadcast.to(data.room).emit('system', {
                message : `${data.name} is connected`
            });
        }
    });

    socket.on('user', data => {
        var room = socket.room;
        //console.log('的用户说：' + room + '的用户说：' + ShowTheObject(data));
        if (room) {
            socket.broadcast.to(room).emit('other', data);
        }
    });
}

//----------------------------工具------------------------------

function ShowTheObject(obj) {
  var des = "";
  for(var name in obj){
	des += name + "(" + obj[name] + ") ";
  }
  return des;
}
