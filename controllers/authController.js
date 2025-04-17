import { getSocketIO } from "../utils/socket.js";


export async function login(req, res) {
    try {
        const io = getSocketIO();
        const { email, password } = req.body;
        const responses = await io.timeout(2000).emitWithAck("login", { email, password });
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
        const { authorization } = req.headers;
        const refreshToken = authorization && authorization.split(' ')[1];
        const responses = await io.timeout(2000).emitWithAck("logout", { authorization });
        console.log('Received responses:', responses);

        res.json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error('Error or timeout:', error);
        res.status(500).json({
            success: false,
            message: "Error or timeout: " + error.message
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
        const { authorization } = req.headers; // Authorization header'dan token alınır
        const refreshToken = authorization && authorization.split(' ')[1]; // Bearer token formatından ayrıştırılır

        if (!refreshToken) {
            return res.send(401, {
                success: false,
                message: "Refresh token bulunamadı."
            });
        }

        // Refresh token doğrulama
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Yeni access token oluşturma
        const newAccessToken = jwt.sign(
            {
                accountId: decodedToken.accountId,
                referenceId: decodedToken.referenceId,
                email: decodedToken.email,
                role: decodedToken.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_EXPIRES_IN }
        );

        console.log("Yeni access token oluşturuldu:", newAccessToken);

        return res.send(200, {
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            console.error("Refresh token doğrulama hatası:", error);
            return res.send(403, {
                success: false,
                message: "Geçersiz veya süresi dolmuş refresh token."
            });
        }

        console.error("Refresh token işlemi sırasında bir hata oluştu:", error);
        return res.send(500, {
            success: false,
            message: "Sunucu hatası: " + error.message
        });
    }
}