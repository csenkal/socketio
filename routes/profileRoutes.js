import { getProfile, getInternCountByMentor, getLeaveCountByMentor, getSurveyCountByMentor } from "../controllers/profileController.js";

export default function profileRoutes(server) {
    server.get("/profile/getProfile", getProfile);
    server.get("/profile/getInternCount", getInternCountByMentor);
    server.get("/profile/getLeaveCount", getLeaveCountByMentor);
    server.get("/profile/getSurveyCount", getSurveyCountByMentor);
}