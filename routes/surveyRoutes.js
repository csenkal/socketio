import { surveyGetAllForUser, answerAdd, surveyGetOne} from "../controllers/surveyController.js";

export default function surveyRoutes(server) {
    server.get("/survey/getAllForUser", surveyGetAllForUser);
    server.post("/survey/answerAdd", answerAdd);
    server.get("/survey/getOne/:id", surveyGetOne);

}