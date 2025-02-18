/*
 * Sample restify server that also accepts socket.io connections.
 *
 * This example shows how to:
 *
 * - serve some API via Restify
 * - serve static files via Restify
 * - receive socket.io connection requests and reply with asynchronous messages (unicast and broadcast)
 */
import { Server } from "socket.io";
import restify from "restify";
import fs from "fs"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const
    SERVER_PORT = 8000,
    PATH_TO_CLIENT_SIDE_SOCKET_IO_SCRIPT = __dirname + "/node_modules/socket.io-client/dist/socket.io.min.js",
    server = restify.createServer(),
    io = new Server(server.server);

const clientsOnline = new Set();



// sample api that generates random numbers
async function random(req, res) {
   var rnd;
   try {
    const responses = await io.timeout(2000).emitWithAck("random");
    rnd = responses[0]
    
    
   } catch (error) {
    //console.log(error);
   }
   console.log('random value in server:',rnd);
   res.send({ value: rnd });
    //console.log('random sent')
    
    
}

server.get("/random", function (req, res, next) {
    random(req, res);
    return next();
  });



// serve client-side socket.io script
server.get("/socket.io.js", function (req, res, next) {
    fs.createReadStream(PATH_TO_CLIENT_SIDE_SOCKET_IO_SCRIPT).pipe(res)
    return next();
});

// serve static files under /public
server.get("/*", restify.plugins.serveStatic({
    directory: __dirname + "/public",
    default: "index.html",
}));

// handle socket.io clients connecting to us
io.sockets.on("connect", socket => {
    clientsOnline.add(socket);
    io.emit("clients-online", clientsOnline.size);

    
    socket.on('message', (msg) => {
        console.log('Message received:', msg);
    });
    // handle client disconnect
    socket.on("disconnect", () => {
        clientsOnline.delete(socket);
        io.emit("clients-online", clientsOnline.size);
    })
});

// send regular messages to all socket.io clients with the current server time
//setInterval(() => clientsOnline.size > 0 && io.emit("server-time", (new Date()).toISOString()), 100);

server.listen(SERVER_PORT, "0.0.0.0", () => console.log(`Listening at ${server.url}`));
