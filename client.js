import { io } from "socket.io-client";
import  https from 'https';

const customHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
};

const customAgent = new https.Agent({
    rejectUnauthorized: false // This will ignore self-signed certificate errors
});


const socket = io('https://socketio-with-restify.onrender.com', {
    auth: {
        clientID: '0195cdb1-950b-7b2b-9827-f41275575743' // Replace with the desired clientID
    },
    extraHeaders: customHeaders,
    agent: customAgent
});


socket.on('connect', () => {
    console.log('Connected to the server');

    // Send a message to the server
    socket.emit('message', 'Hello from client');

    // Optionally, disconnect after sending the message
    
});

socket.on("server-time", severTime => console.log(severTime));

// socket.on("login", (cb) => {
//     console.log('Received message:', cb());
// });

socket.on("login", (data, callback) => {
    console.log('Received login data:', data);
    // Sunucuya yanıt gönder
    callback({ message: 'Acknowledged', receivedData: data });
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});
