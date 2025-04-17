import { getSocketIO } from "../utils/socket.js";

export async function getProfile(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.send({
                success: false,
                message: "Giriş reddedildi. Hatalı Token."
            });
        }

        const response = await io.timeout(2000000).emitWithAck("profile:getProfile", { token });

        console.log("Received response:", JSON.stringify(response, null, 2));
        res.send(response[0]);

    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "Profil alınırken bir hata oluştu: " + error.message,
            error: error
        });
    }
}


export async function getInternCountByMentor(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.send({
                success: false,
                message: "Giriş reddedildi. Hatalı Token."
            });
        }

        const response = await io.timeout(2000000).emitWithAck("profile:getInternCount", { token });

        console.log("Received response:", JSON.stringify(response, null, 2));
        res.send(response[0]);
    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "Stajyer sayısı alınırken bir hata oluştu: " + error.message,
            error: error
        });
    }
}

export async function getLeaveCountByMentor(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.send({
                success: false,
                message: "Giriş reddedildi. Hatalı Token."
            });
        }

        const response = await io.timeout(2000000).emitWithAck("profile:getLeaveCount", { token });

        console.log("Received response:", JSON.stringify(response, null, 2));
        res.send(response[0]);
    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "İzin talebi sayısı alınırken hata oluştu: " + error.message,
            error: error
        });
    }
}


export async function getSurveyCountByMentor(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.send({
                success: false,
                message: "Giriş Reddedildi. Hatalı Token."
            });
        }

        const response = await io.timeout(2000000).emitWithAck("profile:getSurveyCount", { token });

        console.log("Received response:", JSON.stringify(response, null, 2));
        res.send(response[0]);
    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "Anketler alınırken bir hata oluştu: " + error.message,
            error: error
        });
    }
}