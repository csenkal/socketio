import { getSocketIO } from "../utils/socket.js";

export async function addLeave(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const { start, end, description } = req.body;
        const responses = await io.timeout(20000).emitWithAck("leave:add", { token , start, end, description });

        console.log('Received responses:', responses);
        res.json(responses[0]); // İlk yanıtı döndür
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "İzin talebi eklenemedi: " + error.message // Hata mesajı daha açıklayıcı hale getirildi
        });
    }
}


export async function getLeavesByIntern(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000).emitWithAck("leave:getAllByIntern", { token });

        console.log('Received responses:', responses);
        // res.json({
        //     success: true,
        //     message: "Stajyerin izin talepleri başarıyla getirildi.",
        //     data: responses // Data stajyer izin taleplerine göre döndürülüyor
        // });
        const transformedData = responses.map(item => item.data).flat();

        res.json({
            success: true,
            message: null, // Eğer mesaj boş olacaksa null ile değiştirilir
            data: transformedData
        });

    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Stajyerin izin talepleri getirilemedi: " + error.message, // Hata mesajı eklendi
            data: null
        });
    }
}

export async function getLeavesByMentor(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000).emitWithAck("leave:getAllByMentor", { token });

        console.log('Received responses:', JSON.stringify(responses, null, 2));
        res.json({
            success: true,
            message: "Mentörün öğrencilerine ait izin talepleri başarıyla getirildi.",
            data: responses[0].data
        });

    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Mentör verileri getirilemedi: " + error.message, // Hata mesajı eklendi
            data: null
        });
    }
}


export async function getOneLeave(req, res) {
    try {
        const io = getSocketIO();
        const { id } = req.params; 

        const responses = await io.timeout(20000).emitWithAck("leave:getOne", { id });

        console.log("Received responses:", responses);
        res.json({
            success: true,
            message: "İzin talebi başarıyla getirildi.",
            data: responses
        });
    } catch (error) {
        console.error("Error or timeout:", error);
        res.json({
            success: false,
            message: "İzin talebi getirilemedi: " + error.message
        });
    }
}

/*
export async function updateLeave(req, res) {
    try {
        const io = getSocketIO();
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
}
*/

export async function updateLeave(req, res) {
    try {
        const io = getSocketIO();
        const { id } = req.params;
        const updates = req.body;
        const responses = await io.timeout(2000).emitWithAck("leave:update", { id, updates });
        console.log('Received responses:', responses);
        
        if (responses && responses.length > 0) {
            res.json(responses[0]);
        } else {
            res.json({
                success: false,
                message: "İzin talebi güncellenemedi: Yanıt alınamadı"
            });
        }
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "İzin talebi güncellenemedi: " + error.message
        });
    }
}
