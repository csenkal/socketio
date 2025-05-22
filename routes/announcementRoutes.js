import {getAnnouncementsByUser, getOneAnnouncement} from "../controllers/announcementController.js";

export default function announcementRoutes(server) {
    server.get("/announcement/getAllForUser", getAnnouncementsByUser);
    server.get("/announcement/getOne/:id", getOneAnnouncement);
}