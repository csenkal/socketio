import { mentorInternsGetOne, mentorInternsByTerm, InternsByTerm } from "../controllers/connectionController.js";
export default function connectionRoutes(server) {
    server.get("/mentorInternsGetOne/:id", mentorInternsGetOne);
    server.get("/mentorInternsByTerm/:id", mentorInternsByTerm);
    server.get("/InternsByTerm/:id", InternsByTerm);
}