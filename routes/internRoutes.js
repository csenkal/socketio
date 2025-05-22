import { updateIntern } from "../controllers/internController.js";

export default function internRoutes(server) {
    server.put("/intern/update", updateIntern);
}

