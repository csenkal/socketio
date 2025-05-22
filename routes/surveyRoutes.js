import { getSurveysByUser, getOneSurvey , addAnswer} from "../controllers/surveyController.js";

export default function surveyRoutes(server) {
    server.get("/survey/getAllForUser", getSurveysByUser);
    server.post("/survey/answerAdd", addAnswer);
    server.get("/survey/getOne/:id", getOneSurvey);

}