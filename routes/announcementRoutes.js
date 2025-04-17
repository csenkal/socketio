import {announcementGetAllForUser,announcementGetOne} from "../controllers/announcementController.js";

export default function announcementRoutes(server) {
    server.get("/announcement/getAllForUser", announcementGetAllForUser);
    server.get("/announcement/getOne/:id", announcementGetOne);
}