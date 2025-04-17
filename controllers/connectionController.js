import { getSocketIO } from "../utils/socket.js";

export async function mentorInternsGetOne(req, res) {
    try {
        const io = getSocketIO(); // Get the Socket.IO instance
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
}

export async function mentorInternsByTerm(req, res) {
    var responses;
    try {
        const io = getSocketIO(); // Get the Socket.IO instance
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
}

export async function InternsByTerm(req, res) {
    try {
        const io = getSocketIO(); // Get the Socket.IO instance
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
}