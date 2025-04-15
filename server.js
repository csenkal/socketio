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
//import { verifyToken, verifyTokenAndRole } from './middleware/auth.js';

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
//server.use(verifyToken)

async function login(req, res, next) {
    try {
        const { email, password } = req.body; // İstekten e-posta ve şifre bilgilerini al
        const responses = await io.timeout(2000).emitWithAck("login", { email, password }); // tüm istemcilerde login olayını tetikler. her bir istemciden onay bekler.
        console.log('Received responses:', responses);

        // Başarılı yanıt gönderiliyor
        res.json({
            success: true,
            data: responses
        });
        return next(); // Fonksiyon burada sonlanır
    } catch (error) {
        console.error('Error or timeout:', error);

        // Hata durumunda yanıt gönderiliyor
        res.status(500).json({
            success: false,
            message: "Error or timeout: " + error.message
        });
        return next(); // Fonksiyon burada sonlanır
    }
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
        const token = req.headers.authorization?.split(" ")[1];
        const { start, end, description } = req.body;
        const responses = await io.timeout(20000).emitWithAck("leave:add", { token , start, end, description });

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
        const responses = await io.timeout(200000).emitWithAck("leave:getAll");
        console.log('Received cevaplar:', responses);

        if (!responses || responses.length === 0) {
            return res.send(404, {
                success: false,
                message: "Hiçbir izin talebi bulunamadı."
            });
        }

        res.send(200, {
            success: true,
            message: "Tüm izin talepleri başarıyla getirildi.",
            data: responses[0].data
        });

    } catch (error) {
        console.error('Error or timeout:', error);
        return res.send(500, {
            success: false,
            message: "İzin talepleri getirilemedi: " + error.message
        });
    }
}


async function leaveGetAllFromIntern(req, res, next) {
    try {

        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000).emitWithAck("leave:getAllFromIntern", { token });

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
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000).emitWithAck("leave:getAllForMentor", { token });

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



// Duyuru işlemleri
async function announcementGetAllForUser(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000).emitWithAck("announcement:getAllForUser", { token });
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


async function InternsByTerm(req, res, next) {
    try {
        const { id } = req.params; // Extract the internship ID from the request parameters
        const responses = await io.timeout(2000).emitWithAck("internship:getAllInternsByTerms", { id }); // Emit the event and wait for acknowledgment

        console.log('Received responses:', JSON.stringify(responses, null, 2));

        if (!responses || responses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No interns found for the specified term."
            });
        }

        res.json({
            success: true,
            message: "Interns for the specified term retrieved successfully.",
            data: responses // Return the received data
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.status(500).json({
            success: false,
            message: "Error or timeout: " + error.message // Return an error message
        });
    }
    return next();
}

async function refreshToken(req, res) {
    try {
        const { authorization } = req.headers; // Authorization header'dan token alınır
        const refreshToken = authorization && authorization.split(' ')[1]; // Bearer token formatından ayrıştırılır

        if (!refreshToken) {
            return res.send(401, {
                success: false,
                message: "Refresh token bulunamadı."
            });
        }

        // Refresh token doğrulama
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Yeni access token oluşturma
        const newAccessToken = jwt.sign(
            {
                accountId: decodedToken.accountId,
                referenceId: decodedToken.referenceId,
                email: decodedToken.email,
                role: decodedToken.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_EXPIRES_IN }
        );

        console.log("Yeni access token oluşturuldu:", newAccessToken);

        return res.send(200, {
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            console.error("Refresh token doğrulama hatası:", error);
            return res.send(403, {
                success: false,
                message: "Geçersiz veya süresi dolmuş refresh token."
            });
        }

        console.error("Refresh token işlemi sırasında bir hata oluştu:", error);
        return res.send(500, {
            success: false,
            message: "Sunucu hatası: " + error.message
        });
    }
}

//Profile----------------------------------------------------------------------------
async function getProfile(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.send({
          success: false,
          message: "Giriş reddedildi. Hatalı Token."
        });
      }
  
      const response = await io.timeout(2000000).emitWithAck("profile:getProfile", { token });
  
      console.log("Received response:", JSON.stringify(response, null, 2));
      res.send(response);

    } catch (error) {
      console.error("Error or timeout:", error);
      res.send({
        success: false,
        message: "Profil alınırken bir hata oluştu: " + error.message,
        error: error
      });
    }
    return next();
  }

  async function getInternCountByMentor(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.send({
        success: false,
        message: "Giriş reddedildi. Hatalı Token."
      });
    }

    const response = await io.timeout(2000000).emitWithAck("profile:getInternCount", { token });

    console.log("Received response:", JSON.stringify(response, null, 2));
    res.send(response);
  } catch (error) {
    console.error("Error or timeout:", error);
    res.send({
      success: false,
      message: "Stajyer sayısı alınırken bir hata oluştu: " + error.message,
      error: error
    });
  }
  return next();
}

async function getLeaveCountByMentor(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
  
      if (!token) {
        return res.send({
          success: false,
          message: "Giriş reddedildi. Hatalı Token."
        });
      }
  
      const response = await io.timeout(2000000).emitWithAck("profile:getLeaveCount", { token });
  
      console.log("Received response:", JSON.stringify(response, null, 2));
      res.send(response);
    } catch (error) {
      console.error("Error or timeout:", error);
      res.send({
        success: false,
        message: "İzin talebi sayısı alınırken hata oluştu: " + error.message,
        error: error
      });
    }
    return next();
  }

  async function getSurveyCountByMentor(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
  
      if (!token) {
        return res.send({
          success: false,
          message: "Giriş Reddedildi. Hatalı Token."
        });
      }
  
      const response = await io.timeout(2000000).emitWithAck("profile:getSurveyCount", { token });
  
      console.log("Received response:", JSON.stringify(response, null, 2));
      res.send(response);
    } catch (error) {
      console.error("Error or timeout:", error);
      res.send({
        success: false,
        message: "Anketler alınırken bir hata oluştu: " + error.message,
        error: error
      });
    }
    return next();
  }



//Auth-------------------------------------------------------------------------------
server.post("/login", function (req, res, next) {
    return login(req, res, next);
});

server.post("/refreshtoken", function (req, res, next) {
    return refreshToken(req, res, next);
});

server.post("/change-password", function (req, res, next) {
    return changePassword(req, res, next);
});

server.post("/logout", function (req, res, next) {
    return logout(req, res, next);
});

//Connection-------------------------------------------------------------------------
server.get("/mentorInternsGetOne/:id", function (req, res, next) {
    return mentorInternsGetOne(req, res, next);
});

server.get("/mentorInternsByTerm/:id", function (req, res, next) {
    return mentorInternsByTerm(req, res, next); 
});

server.get("/InternsByTerm/:id", function (req, res, next) {
    return InternsByTerm(req, res, next);
});

//Internship-------------------------------------------------------------------------
server.get("/internship/getAll", function (req, res, next) {
    return internshipGetAll(req, res, next);
});

//Survey-----------------------------------------------------------------------------
server.get("/survey/getAllForUser", function (req, res, next) {
    return surveyGetAllForUser(req, res, next);
});

server.post("/survey/answerAdd", function (req, res, next) {
    return answerAdd(req, res, next);
});

server.get("/survey/getOne/:id", function (req, res, next) {
    return surveyGetOne(req, res, next);
});

//Leave------------------------------------------------------------------------------
server.post("/leave/add", function (req, res, next) {
    return leaveAdd(req, res, next);
});

server.get("/leave/getAll", function (req, res, next) {
    return leaveGetAll(req, res, next);
});

server.get("/leave/getAllFromIntern", function (req, res, next) {
    return leaveGetAllFromIntern(req, res, next);
});

server.get("/leave/getAllForMentor", function (req, res, next) {
    return leaveGetAllForMentor(req, res, next);
});

server.put("/leave/update/:id", function (req, res, next) {
    return leaveUpdate(req, res, next);
});

server.put("/leave/delete/:id", function (req, res, next) {
    return leaveDelete(req, res, next);
});

//Announcement-----------------------------------------------------------------------

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

//Profile----------------------------------------------------------------------------
server.get("/profile/getProfile", function (req, res, next) {
    return getProfile(req, res, next);
});

server.get("/profile/getInternCount", function (req, res, next) {
    return getInternCountByMentor(req, res, next);
});

server.get("/profile/getLeaveCount", function (req, res, next) {
    return getLeaveCountByMentor(req, res, next);
});

server.get("/profile/getSurveyCount", function (req, res, next) {
    return getSurveyCountByMentor(req, res, next);
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
