import { getSocketIO } from "../utils/socket.js";

export async function getInternsForMentor(req, res) {
    try {
        const io = getSocketIO(); 
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000).emitWithAck("mentorConnection:getOne", { token }); 

        console.log('Received responses:', JSON.stringify(responses, null, 2));
        res.json({
            success: true,
            data: responses 
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Error or timeout: " + error.message 
        });
    }
}

export async function mentorInternsByTerm(req, res) {
    var responses;
    try {
        const io = getSocketIO(); // Get the Socket.IO instance
        const token = req.headers.authorization?.split(" ")[1];
        const { id } = req.params;
        responses = await io.timeout(2000).emitWithAck("mentorConnection:getFiltered", { token, id });
        console.log('Received responses:', JSON.stringify(responses, null, 2));

        // Extract necessary fields from the response to match the desired format
        const { mentorName, interns } = responses[0];
        res.json({
            success: true,
            message: null,
            mentorName: mentorName,
            data: interns
        });
    } catch (error) {
        console.error('Error or timeout:', error);

        // Return a structured response in case of error or timeout
        res.json({
            success: true,
            message: null,
            data: responses || []
        });
    }
}

