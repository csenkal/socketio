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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const
    SERVER_PORT = 8001,
    PATH_TO_CLIENT_SIDE_SOCKET_IO_SCRIPT = __dirname + "/node_modules/socket.io-client/dist/socket.io.min.js",
    server = restify.createServer(),
    io = new Server(server.server);

const clientsOnline = new Set();


// Body parser eklentisini kullanarak gelen JSON verilerini ayrıştırın
server.use(restify.plugins.bodyParser());



async function login(req, res, next) {
    try {
        const { email, password } = req.body; // İstekten e-posta ve şifre bilgilerini al
        const responses = await io.timeout(2000).emitWithAck("login", { email, password }); // tüm istemcilerde login olayını tetikler. her bir istemciden onay bekler.
        console.log('Received responses:', responses);
        res.json({
            success: true,
            data: responses
        });

    } catch (error) {
        console.error('Error or timeout:', error);
    }
    res.send({ value: req.body });
    return next();
}




async function changePassword(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const { newPassword, oldPassword } = req.body;
        const responses = await io.timeout(2000).emitWithAck("change-password", { token, newPassword, oldPassword });
        console.log('Received responses:', responses);
        res.json({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Error or timeout: " + error
        });
    }
    return next();
}

async function logout(req, res, next) {
    try {
        const { authorization } = req.headers;
        const refreshToken = authorization && authorization.split(' ')[1];
        const responses = await io.timeout(2000).emitWithAck("logout", { authorization });
        console.log('Received responses:', responses);
    } catch (error) {
        console.error('Error or timeout:', error);
    }
    res.send({ value: req.body });
    return next();
}


// Leave işlemleri
async function leaveAdd(req, res, next) {
    try {
        const { internId, start, end, description } = req.body;
        const responses = await io.timeout(20000).emitWithAck("leave:add", { internId, start, end, description });

        console.log('Received responses:', responses);
        res.json({
            success: true,
            message: "İzin talebi başarıyla eklendi.",
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "İzin talebi eklenemedi: " + error.message // Hata mesajı daha açıklayıcı hale getirildi
        });
    }
    return next();
}

async function leaveGetAll(req, res) {
    try {
        // Emit ile 'leave:getAll' olayını tetikleyip, cevap bekliyoruz
        const responses = await io.timeout(2000).emitWithAck("leave:getAll");

        // Gelen yanıtları kontrol ediyor ve yanıtı döndürüyoruz
        console.log('Received responses:', responses);
        return res.status(200).json({
            success: true,
            message: "Tüm izin talepleri başarıyla getirildi.",
            data: responses // Data başarıyla döndürülüyor
        });
    } catch (error) {
        // Eğer hata oluşursa, burada loglanıyor ve istemciye hata mesajı gönderiliyor
        console.error('Error or timeout:', error);
        return res.status(500).json({
            success: false,
            message: "İzin talepleri getirilemedi: " + error.message
        });
    }
}

async function leaveGetAllFromIntern(req, res, next) {
    try {
        const { id } = req.params;
        const responses = await io.timeout(2000).emitWithAck("leave:getAllFromIntern", { id });

        console.log('Received responses:', responses);
        res.json({
            success: true,
            message: "Stajyerin izin talepleri başarıyla getirildi.",
            data: responses // Data stajyer izin taleplerine göre döndürülüyor
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Stajyerin izin talepleri getirilemedi: " + error.message // Hata mesajı eklendi
        });
    }
    return next();
}

async function leaveGetAllForMentor(req, res, next) {
    try {
        const { id } = req.params;
        const responses = await io.timeout(2000).emitWithAck("leave:getAllForMentor", { id });

        console.log('Received responses:', JSON.stringify(responses, null, 2));
        res.json({
            success: true,
            message: "Mentörün öğrencilerine ait izin talepleri başarıyla getirildi.",
            data: responses // Mentör verileri başarıyla döndürülüyor
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Mentör verileri getirilemedi: " + error.message // Hata mesajı eklendi
        });
    }
    return next();
}

async function leaveUpdate(req, res, next) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const responses = await io.timeout(2000).emitWithAck("leave:update", { id, updates });

        console.log('Received responses:', responses);
        res.json({
            success: true,
            message: "İzin talebi başarıyla güncellendi.",
            data: responses // Güncellenmiş veriler döndürülüyor
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "İzin talebi güncellenemedi: " + error.message // Hata mesajı eklendi
        });
    }
    return next();
}

async function leaveDelete(req, res, next) {
    try {
        const { id } = req.params;
        const responses = await io.timeout(2000).emitWithAck("leave:delete", { id });

        console.log('Received responses:', responses);
        res.json({
            success: true,
            message: "İzin talebi başarıyla silindi.",
            data: responses // Silme işlemine ait bilgiler döndürülüyor
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "İzin talebi silinemedi: " + error.message // Hata mesajı eklendi
        });
    }
    return next();
}


// Mentor interns by term işlemleri
async function mentorInternsByTerm(req, res, next) {
    try {
        const { id } = req.params;
        const { internshipId } = req.query;
        const responses = await io.timeout(2000).emitWithAck("mentorConnection:getFiltered", { id, internshipId });
        console.log('Received responses:', JSON.stringify(responses, null, 2));
        res.json({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Error or timeout: " + error
        });
    }
    return next();
}


async function internshipGetAll(req, res, next) {
    try {
        const responses = await io.timeout(2000000).emitWithAck("internship:getAll");
        console.log('Received responses:', JSON.stringify(responses, null, 2));
        res.json({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Error or timeout: " + error,
            error : error
        });
    }
    return next();
}


server.post("/login", function (req, res, next) {
    return login(req, res, next);

});



server.post("/change-password", function (req, res, next) {
    return changePassword(req, res, next);
});


server.post("/logout", function (req, res, next) {
    return logout(req, res, next);
});


server.post("/leave/add", function (req, res, next) {
    return leaveAdd(req, res, next);
});

server.get("/leave/getAll", function (req, res, next) {
    return leaveGetAll(req, res, next);
});

server.get("/leave/getAllFromIntern/:id", function (req, res, next) {
    return leaveGetAllFromIntern(req, res, next);
});

server.get("/leave/getAllForMentor/:id", function (req, res, next) {
    return leaveGetAllForMentor(req, res, next);
});

server.put("/leave/update/:id", function (req, res, next) {
    return leaveUpdate(req, res, next);
});

server.put("/leave/delete/:id", function (req, res, next) {
    return leaveDelete(req, res, next);
});


server.get("/mentorInternsByTerm/:id", function (req, res, next) {
     return mentorInternsByTerm(req, res, next); 
});


server.get("/internship/getAll", function (req, res, next) {
    return internshipGetAll(req, res, next);
});


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
