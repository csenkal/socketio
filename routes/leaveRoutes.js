import {addLeave , getOneLeave, getLeavesByIntern, getLeavesByMentor, updateLeave} from "../controllers/leaveController.js";

export default function leaveRoutes(server) {
    server.post("/leave/add", addLeave);
    server.get("/leave/getAllFromIntern", getLeavesByIntern);
    server.get("/leave/getAllForMentor", getLeavesByMentor);
    server.get("/leave/getOne/:id" , getOneLeave)
    server.put("/leave/update/:id",updateLeave);
}