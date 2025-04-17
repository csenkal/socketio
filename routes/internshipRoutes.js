import {internshipGetAll} from "../controllers/internshipController.js";

export default function internshipRoutes(server) {
    server.get("/internship/getAll", internshipGetAll);
}