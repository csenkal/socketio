import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const agent = new https.Agent({
    rejectUnauthorized: false // SSL hatalarını yok say
});

// Firebase kimlik bilgilerini dosyadan yükle
const serviceAccountPath = path.join(__dirname, 'firebase-credentials.json');

if (!fs.existsSync(serviceAccountPath) && process.env.FIREBASE_CREDENTIALS_BASE64) {
    const buffer = Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64');
    fs.writeFileSync(serviceAccountPath, buffer);
    console.log('Firebase kimlik bilgileri başarıyla oluşturuldu');
}

let serviceAccount;

try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('Firebase kimlik bilgileri başarıyla yüklendi');
} catch (error) {
    console.error('Firebase kimlik bilgileri yüklenemedi:', error);
    process.exit(1);
}

// Firebase Admin SDK'yı başlat
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    httpAgent: agent
});

export default admin;