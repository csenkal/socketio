import { getSocketIO } from "../utils/socket.js";

export async function leaveAdd(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const { start, end, description } = req.body;
        const responses = await io.timeout(20000).emitWithAck("leave:add", { token , start, end, description });

        console.log('Received responses:', responses);
        res.json({
            success: true,
            message: "İzin talebi başarıyla eklendi.",
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "İzin talebi eklenemedi: " + error.message // Hata mesajı daha açıklayıcı hale getirildi
        });
    }
}


export async function leaveGetAllFromIntern(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000).emitWithAck("leave:getAllFromIntern", { token });

        console.log('Received responses:', responses);
        res.json({
            success: true,
            message: "Stajyerin izin talepleri başarıyla getirildi.",
            data: responses // Data stajyer izin taleplerine göre döndürülüyor
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Stajyerin izin talepleri getirilemedi: " + error.message // Hata mesajı eklendi
        });
    }
}

export async function leaveGetAllForMentor(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const responses = await io.timeout(2000).emitWithAck("leave:getAllForMentor", { token });

        console.log('Received responses:', JSON.stringify(responses, null, 2));
        res.json({
            success: true,
            message: "Mentörün öğrencilerine ait izin talepleri başarıyla getirildi.",
            data: responses // Mentör verileri başarıyla döndürülüyor
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Mentör verileri getirilemedi: " + error.message // Hata mesajı eklendi
        });
    }
}


export async function leaveUpdate(req, res) {
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
