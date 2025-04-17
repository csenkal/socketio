import { getSocketIO } from "../utils/socket.js";

export async function internshipGetAll(req, res) {
    try {
        const io = getSocketIO();
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
}