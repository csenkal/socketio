import { getSocketIO } from "../utils/socket.js";
import jwt from "jsonwebtoken";

export async function login(req, res) {
    try {
        const io = getSocketIO();
        const { email, password, fcmToken} = req.body;
        const responses = await io.timeout(2000).emitWithAck("login", { email, password, fcmToken });
        console.log('Received responses:', responses);

        res.send({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.send({
            success: false,
            message: "Error or timeout: " + error.message
        });
    }
}

export async function logout(req, res) {
    try {
        const io = getSocketIO();
        const { authorization } = req.headers;
        const refreshToken = authorization && authorization.split(' ')[1];
        const responses = await io.timeout(2000).emitWithAck("logout", { authorization });
        console.log('Received responses:', responses);

        res.send({
            success: true,
            message: "Başarıyla çıkış yapıldı."
        });
    } catch (error) {
        console.error('Hata meydana geldi: ', error);

        res.send({
            success: false,
            message: "Hata meydana geldi: " + error.message
        });
    }
}


export async function changePassword(req, res) {
    try {
        const io = getSocketIO();
        const token = req.headers.authorization?.split(" ")[1];
        const { newPassword, oldPassword } = req.body;
        const responses = await io.timeout(2000).emitWithAck("change-password", { token, newPassword, oldPassword });
        console.log('Received responses:', responses);
        res.json({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.json({
            success: false,
            message: "Error or timeout: " + error
        });
    }
}



export async function refreshToken(req, res) {
    try {
        const io = getSocketIO();
        const authHeader = req.headers['authorization'];
        const refreshToken = authHeader && authHeader.split(' ')[1]; 

        const responses = await io.timeout(2000).emitWithAck("refreshtoken", { refreshToken });
        console.log('Received responses:', responses);
    
        if (responses[0]?.status === 401) {
            res.send({
                success: false,
                message: "Refresh token girişi yapılmalıdır!"
            });
        } else if (responses[0]?.status === 400) {
            res.send({
                success: false,
                message: "Refresh token veritabanında bulunamadı veya geçersiz token gönderildi."
            });
        } else if (responses[0]?.status === 403) {
            res.send({
                success: false,
                message: "Süresi dolmuş refresh token."
            });
        } else {

            let newAccessToken = Array.isArray(responses) ? responses[0]?.accessToken : responses.newAccessToken;
    
            if (!newAccessToken) {
                res.send({
                    success: false,
                    message: "Yeni access token alınamadı."
                });
            } else {
                res.send({
                    success: true,
                    message: "Token başarıyla alındı.",
                    newAccessToken
                });
            }
        }
        
    } catch (error) {
        console.error("Refresh token işlemi sırasında bir hata oluştu:", error);
        if (!res.headersSent) { 
            res.send({
                success: false,
                message: "Sunucu hatası: " + error.message
            });
        }
    }
}

