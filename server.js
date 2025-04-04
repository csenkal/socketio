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
        const responses = await io.timeout(200000).emitWithAck("leave:getAll");
        console.log('Received cevaplar:', responses);

        if (!responses || responses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Hiçbir izin talebi bulunamadı."
            });
        }
        //console.log('Ress:', res);
        
        // Gelen yanıtları kontrol ediyor ve yanıtı döndürüyoruz
        console.log('Received responses:', responses);
        res.send(200, {
            success: true,
            message: "Tüm izin talepleri başarıyla getirildi.",
            data: responses[0].data
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
    var responses;
    try {
        const { id } = req.params;
        const { internshipId } = req.query;
        responses = await io.timeout(2000).emitWithAck("mentorConnection:getFiltered", { id, internshipId });
        console.log('Received responses:', JSON.stringify(responses, null, 2));
        res.json({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: true,
            data: responses
        });
    }
    return next();
}


async function internshipGetAll(req, res, next) {
    try {
        const responses = await io.timeout(2000000).emitWithAck("internship:getAll");
        console.log('Received responses:', JSON.stringify(responses, null, 2));
        
        // Başarılı yanıtları gönder
        res.send({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        
        // Hata mesajlarını gönder
        res.send({
            success: false,
            message: "Error or timeout: " + error,
            error: error
        });
    }
    return next();
}

async function mentorInternsGetOne(req, res, next) {
    try {
        const { id } = req.params; // Extract mentor ID from the request parameters
        const responses = await io.timeout(2000).emitWithAck("mentorConnection:getOne", { id }); // Emit the event and wait for acknowledgment

        console.log('Received responses:', JSON.stringify(responses, null, 2));
        res.json({
            success: true,
            data: responses // Return the received data
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Error or timeout: " + error.message // Return an error message
        });
    }
    return next();
}



async function announcementGetAllForUser(req, res, next) {
    try {
        const { referenceId } = req.query; // Kullanıcıdan gelen referenceId sorgu parametresinden alınır
        const responses = await io.timeout(2000).emitWithAck("announcement:getAllForUser", { referenceId });
        console.log("Received responses:", responses);

        res.json({
            success: true,
            data: responses,
        });
    } catch (error) {
        console.error("Error or timeout:", error);
        res.status(500).json({
            success: false,
            message: "Error or timeout: " + error.message,
        });
    }
    return next();
}

async function announcementGetOne(req, res, next) {
    try {
        const { id } = req.params; // Duyuru ID'si
        const responses = await io.timeout(2000).emitWithAck("announcement:getOne", { id });
        console.log("Received responses:", responses);

        res.json({
            success: true,
            data: responses,
        });
    } catch (error) {
        console.error("Error or timeout:", error);
        res.status(500).json({
            success: false,
            message: "Error or timeout: " + error.message,
        });
    }
    return next();
}

async function announcementAddWithTargetIds(req, res, next) {
    try {
        const { title, message, internshipId, targetIds } = req.body;
        const responses = await io.timeout(2000).emitWithAck("announcement:addWithTargetIds", {
            title,
            message,
            internshipId,
            targetIds,
        });
        console.log("Received responses:", responses);

        res.json({
            success: true,
            message: "Duyuru başarıyla oluşturuldu.",
            data: responses,
        });
    } catch (error) {
        console.error("Error or timeout:", error);
        res.status(500).json({
            success: false,
            message: "Error or timeout: " + error.message,
        });
    }
    return next();
}

async function announcementUpdate(req, res, next) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const responses = await io.timeout(2000).emitWithAck("announcement:update", { id, updates });
        console.log("Received responses:", responses);

        res.json({
            success: true,
            message: "Duyuru başarıyla güncellendi.",
            data: responses,
        });
    } catch (error) {
        console.error("Error or timeout:", error);
        res.status(500).json({
            success: false,
            message: "Error or timeout: " + error.message,
        });
    }
    return next();
}

async function announcementDelete(req, res, next) {
    try {
        const { id } = req.params;
        const responses = await io.timeout(2000).emitWithAck("announcement:delete", { id });
        console.log("Received responses:", responses);

        res.json({
            success: true,
            message: "Duyuru başarıyla silindi.",
            data: responses,
        });
    } catch (error) {
        console.error("Error or timeout:", error);
        res.status(500).json({
            success: false,
            message: "Error or timeout: " + error.message,
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

server.get("/hello", function (req, res, next) {
    return internshipGetAll(req, res, next);
});

server.get("/mentorInternsGetOne/:id", function (req, res, next) {
    return mentorInternsGetOne(req, res, next);
});

server.get("/announcement/getAllForUser", function (req, res, next) {
    return announcementGetAllForUser(req, res, next);
});

server.get("/announcement/getOne/:id", function (req, res, next) {
    return announcementGetOne(req, res, next);
});

server.put("/announcement/update/:id", function (req, res, next) {
    return announcementUpdate(req, res, next);
});

server.put("/announcement/delete/:id", function (req, res, next) {
    return announcementDelete(req, res, next);
});

// server.post("/announcement/addWithInternshipId", function (req, res, next) {
//     return announcementAddWithInternshipId(req, res, next);
// });

// server.post("/announcement/addWithSchool", function (req, res, next) {
//     return announcementAddWithSchool(req, res, next);
// });

// server.post("/announcement/addWithMentorId", function (req, res, next) {
//     return announcementAddWithMentorId(req, res, next);
// });

// server.post("/announcement/addWithTargetIds", function (req, res, next) {
//     return announcementAddWithTargetIds(req, res, next);
// });

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
