import { mentorInternsByTerm, getInternsForMentor } from "../controllers/connectionController.js";
export default function connectionRoutes(server) {
    server.get("/internsForMentor", getInternsForMentor);
    server.get("/mentorInternsByTerm/:id", mentorInternsByTerm);
}