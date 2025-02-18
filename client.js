import { io } from "socket.io-client";
import  https from 'https';

const customHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
};

const customAgent = new https.Agent({
    rejectUnauthorized: false // This will ignore self-signed certificate errors
});


const socket = io('https://socketio-with-restify.onrender.com', {

    extraHeaders: customHeaders,
    agent: customAgent
});


//const socket = io('http://127.0.0.1:8000')

socket.on('connect', () => {
    console.log('Connected to the server');

    // Send a message to the server
    socket.emit('message', 'Hello from client');

    // Optionally, disconnect after sending the message
    
});

socket.on("server-time", severTime => console.log(severTime));

socket.on("random", (cb) => {
    console.log('Random request received');
    //socket.emit("randomResponse",{ value: (Math.random() * 1000).toFixed(0)});
    var rnd = (Math.random() * 1000).toFixed(0);
    cb(rnd);
    console.log('Random response sent: ' , rnd);
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});
