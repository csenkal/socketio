import { getSocketIO } from "../utils/socket.js";

export async function getAllInternships(req, res) {
    try {
        const io = getSocketIO();
        const responses = await io.timeout(2000000).emitWithAck("internship:getAll");
        console.log('Received responses:', JSON.stringify(responses, null, 2));
        
        // Başarılı yanıtları gönder
        if (responses && responses.length > 0 && responses[0].success) {
            const formattedResponse = {
                success: true,
                data: responses[0].data
            };

            res.send(formattedResponse);
        } else {
            res.send({
                success: false,
                message: "No valid data received"
            });
        }

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


export async function getMentorInternships(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000000).emitWithAck("internship:getMentorInternships" , {token});
        console.log('Received responses:', JSON.stringify(responses, null, 2));
        
        if (responses && responses.length > 0 && responses[0].success) {
            const formattedResponse = {
                success: true,
                message: null,
                data: responses[0].data
            };

            res.send(formattedResponse);
        } else {
            res.send({
                success: false,
                message: "No valid data received"
            });
        }
    } catch (error) {
        console.error('Error or timeout:', error);
        
        res.send({
            success: false,
            message: "Error or timeout: " + error,
            error: error
        });
    }
}