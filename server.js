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
import path from 'path'
import { initializeSocket } from "./utils/socket.js";
//import { verifyToken, verifyTokenAndRole } from './middleware/auth.js';
import authRoutes from "./routes/authRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);



const
    SERVER_PORT = 8001,
    PATH_TO_CLIENT_SIDE_SOCKET_IO_SCRIPT = __dirname + "/node_modules/socket.io-client/dist/socket.io.min.js",
    server = restify.createServer(),
    io = initializeSocket(server);

const clientsOnline = new Set();


// Body parser eklentisini kullanarak gelen JSON verilerini ayrıştırın
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());
//server.use(verifyToken)

authRoutes(server);
leaveRoutes(server);
announcementRoutes(server);
connectionRoutes(server);
profileRoutes(server);
surveyRoutes(server);
internshipRoutes(server);

// serve client-side socket.io script
server.get('/socket.io.js', restify.plugins.serveStatic({
    directory: path.join(__dirname, 'node_modules', 'socket.io', 'client-dist'),
    file: 'socket.io.min.js'
}));

server.get('/', function indexHTML(req, res, next) {
    fs.readFile(__dirname + '/public/index.html', function (err, data) {
        if (err) {
            next(err);
            return;
        }

        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(data);
        next();
    });
});

// serve static files under /public
/*
server.get("/*", restify.plugins.serveStatic({
    directory: __dirname + "/public",
    default: "index.html",
}));
*/
io.use((socket, next) => {
    const clientID = socket.handshake.auth.clientID; // Extract clientID from handshake auth data
    
    if (isValidClientID(clientID)) { // Replace with your validation logic
      next(); // Allow the client to connect
    } else {
      console.log(`Connection denied for client: ${socket.id}`);
      const err = new Error('Invalid clientID'); // Custom error message
      err.data = { reason: 'Invalid clientID' }; // Additional error details if needed
      next(err); // Deny connection
    }
  });

  function isValidClientID(clientID) {
    const allowedClientIDs = ['0195cdb1-950b-7b2b-9827-f41275575743']; // Example: List of allowed clientIDs
    return allowedClientIDs.includes(clientID); // Check if clientID is in the list
  }
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
