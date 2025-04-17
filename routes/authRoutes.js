import { login, logout , changePassword, refreshToken } from "../controllers/authController.js";

export default function authRoutes(server) {
    server.post("/login", login);
    server.post("/logout", logout);
    server.post("/change-password", changePassword);
    server.post("/refreshtoken", refreshToken);
}