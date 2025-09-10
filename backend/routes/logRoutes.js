import express from "express";
import { createLog, getLogStats, getErrorLogs } from "../controllers/logController.js";

const router = express.Router();

router.post("/", createLog);     
router.get("/stats", getLogStats); 
router.get("/errors", getErrorLogs);

export default router;
