import express from "express";
import {
  enqueueLog,
  createLogDirect,
  getLogStats,
  getErrorLogs,
  getMonthlyStats
} from "../controllers/logController.js";

const router = express.Router();

router.post("/", enqueueLog);            
router.post("/direct", createLogDirect); 
router.get("/stats", getLogStats);      
router.get("/errors", getErrorLogs); 
router.get("/monthly-stats", getMonthlyStats);    

export default router;
