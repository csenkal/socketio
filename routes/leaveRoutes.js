import { leaveAdd, leaveGetAllForMentor, leaveGetAllFromIntern, leaveUpdate } from "../controllers/leaveController.js";

export default function leaveRoutes(server) {
    server.post("/leave/add", leaveAdd);
    server.get("/leave/getAllFromIntern", leaveGetAllFromIntern);
    server.get("/leave/getAllForMentor", leaveGetAllForMentor);
    server.put("/leave/update/:id",leaveUpdate);
}