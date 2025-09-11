import express from "express";
import {
  enqueueLog,
  createLogDirect,
  getLogStats,
  getErrorLogs
} from "../controllers/logController.js";

const router = express.Router();

router.post("/", enqueueLog);            
router.post("/direct", createLogDirect); 
router.get("/stats", getLogStats);      
router.get("/errors", getErrorLogs);     

export default router;
