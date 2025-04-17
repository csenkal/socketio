import { getSocketIO } from "../utils/socket.js";

export async function announcementGetAllForUser(req, res) {
    try {
        const io = getSocketIO();
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
}


export async function announcementGetOne(req, res) {
    try {
        const io = getSocketIO();
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
}

 