import { getSocketIO } from "../utils/socket.js";

export async function getSurveysByUser(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000000).emitWithAck("survey:getAllByUser", { token });
        console.log('Received responses:', JSON.stringify(responses, null, 2));

        // Gelen verilerde internshipPeriod alanı, eğer bir obje olarak geldiyse, yalnızca adını alıyoruz.
        const formattedSurveys = responses.map(survey => {
            // Eğer internshipPeriod populate edilmişse ve name içeriyorsa:
            if (survey.internshipPeriod && survey.internshipPeriod.name) {
                survey.internshipPeriod = survey.internshipPeriod.name;
            }
            return survey;
        });

        res.send(responses[0]);
    } catch (error) {
        console.error('Error or timeout:', error);
        
        res.send({
            success: false,
            message: "Anketler alınırken bir hata oluştu: " + error.message,
            error: error
        });
    }
}

/*
export async function addAnswer(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const { survey, answers } = req.body;

        const response = await io.timeout(2000000).emitWithAck("survey:addAnswer", { token, survey, answers });

        console.log("Received response:", JSON.stringify(response, null, 2));

        res.send(response);
    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "Anket cevap eklenirken bir hata oluştu: " + error.message,
            error: error
        });
    }
}
*/

export async function addAnswer(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const { survey, answers } = req.body;

        const response = await io.timeout(2000000).emitWithAck("survey:addAnswer", { token, survey, answers });

        console.log("Received response:", JSON.stringify(response, null, 2));

        res.send(response[0]); 
    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "Anket cevap eklenirken bir hata oluştu: " + error.message,
            error: error
        });
    }
}

export async function getOneSurvey(req, res) {
    try {
        const io = getSocketIO();
        const { id } = req.params;
        if (!id) {
            return res.send({
                success: false,
                message: "Geçersiz anket ID'si."
            });
        }

        const response = await io
            .timeout(2000000)
            .emitWithAck("survey:getOne", { id });

        console.log("Received response:", JSON.stringify(response, null, 2));
        res.send(response);
    } catch (error) {
        console.error("Error or timeout:", error);
        res.send({
            success: false,
            message: "Anket alınırken bir hata oluştu: " + error.message,
            error: error
        });
    }
}
