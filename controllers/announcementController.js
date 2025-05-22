import { getSocketIO } from "../utils/socket.js";

export async function getAnnouncementsByUser(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(40000).emitWithAck("announcement:getAllByUser", { token });
        console.log("Received responses:", responses);

        res.send(responses[0]);
    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "Error or timeout: " + error.message,
        });
    }
}



export async function getOneAnnouncement(req, res) {
    try {
        const io = getSocketIO();
        const { id } = req.params; 
        const responses = await io.timeout(2000).emitWithAck("announcement:getOne", { id });
        console.log("Received responses:", responses);

        res.send(responses[0]);
    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "Error or timeout: " + error.message,
        });
    }
}


 
