import admin from '../utils/firebase/firebase.js';

export async function sendNotification(notificationData, callback) {
    try {
        const { type, target, title, body } = notificationData;

        // Bilgileri kontrol et
        if (!type || !target || !title || !body) {
            console.error('Eksik bilgi içeren bildirim isteği');
            if (callback) {
                callback({
                    success: false,
                    message: 'Eksik bilgi: type, target, title ve body gereklidir'
                });
            }
            return;
        }

        let result;
        
        // Token bazlı gönderim
        if (Array.isArray(target)) {
            result = await sendMulticastNotification(target, title, body);
        } else {
            result = await sendSingleNotification(target, title, body);
        }

        // Başarılı yanıt
        console.log('Bildirim başarıyla gönderildi:', result);

        // Callback ile yanıt ver
        if (callback) {
            callback({
                success: true,
                result
            });
        }

    } catch (error) {
        console.error('Bildirim gönderilirken hata oluştu:', error);

        if (callback) {
            callback({
                success: false,
                message: error.message,
                code: error.code
            });
        }
    }
}

export async function sendSingleNotification(target, title, body) {
    try {
        const message = {
            notification: {
                title,
                body
            },
            android: {
                priority: 'high',
                notification: {
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                }
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                        badge: 1
                    }
                }
            },
            token: target // Tekil token
        };

        const result = await admin.messaging().send(message);
        console.log('Tekil bildirim gönderildi:', result);
        return result;
    } catch (error) {
        console.error('Tekil bildirim gönderilirken hata oluştu:', error);
        throw error;
    }
}

export async function sendMulticastNotification(targets, title, body) {
    try {
        const multicastMessage = {
            notification: {
                title,
                body
            },
            android: {
                priority: 'high',
                notification: {
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                }
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                        badge: 1
                    }
                }
            },
            tokens: targets // Token listesi
        };

        const result = await admin.messaging().sendEachForMulticast(multicastMessage);
        console.log('Toplu bildirim gönderildi:', result);
        return result;
    } catch (error) {
        console.error('Toplu bildirim gönderilirken hata oluştu:', error);
        throw error;
    }
}