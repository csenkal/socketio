import { getSocketIO } from "../utils/socket.js";


export async function updateIntern(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const updates = req.body
        const responses = await io.timeout(2000000).emitWithAck("intern:update" , {token , updates});
        console.log('Received responses:', JSON.stringify(responses, null, 2));
        
        res.send({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.send({
            success: false,
            message: "Error or timeout: " + error,
            error: error
        });
    }
}