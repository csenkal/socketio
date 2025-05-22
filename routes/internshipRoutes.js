import {getAllInternships , getMentorInternships} from "../controllers/internshipController.js";

export default function internshipRoutes(server) {
    server.get("/internship/getAll", getAllInternships);
    server.get("/internship/getMentorInternships" , getMentorInternships);
}