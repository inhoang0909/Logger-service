import express from "express";
import {
  enqueueLog,
  createLogDirect,
  getLogStats,
  getErrorLogs,
  getMonthlyStats
} from "../controllers/logController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: API endpoints for logging services
 */

/**
 * @swagger
 * /logs:
 *   post:
 *     summary: Enqueue a log into Redis queue
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [service, endpoint, method, status, ip]
 *             properties:
 *               service:
 *                 type: string
 *               endpoint:
 *                 type: string
 *               method:
 *                 type: string
 *               status:
 *                 type: number
 *               ip:
 *                 type: string
 *               duration:
 *                 type: number
 *               errorMessage:
 *                 type: string
 *               errorStack:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Log enqueued successfully
 *       400:
 *         description: Invalid log format
 */
router.post("/", enqueueLog);

/**
 * @swagger
 * /logs/direct:
 *   post:
 *     summary: Create a log directly in MongoDB (without Redis)
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [service, endpoint, method, status, ip]
 *             properties:
 *               service:
 *                 type: string
 *               endpoint:
 *                 type: string
 *               method:
 *                 type: string
 *               status:
 *                 type: number
 *               ip:
 *                 type: string
 *               duration:
 *                 type: number
 *               errorMessage:
 *                 type: string
 *               errorStack:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       201:
 *         description: Log created directly in MongoDB
 *       500:
 *         description: Server error
 */
router.post("/direct", createLogDirect);

/**
 * @swagger
 * /logs/stats:
 *   get:
 *     summary: Get grouped log statistics (by service, endpoint, method, status, IP and date)
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Aggregated log stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: object
 *                       totalCalls:
 *                         type: number
 *                       successCalls:
 *                         type: number
 *                       errorCalls:
 *                         type: number
 *       500:
 *         description: Internal server error
 */
router.get("/stats", getLogStats);

/**
 * @swagger
 * /logs/errors:
 *   get:
 *     summary: Get error logs by date (from Redis)
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: "Date in format YYYY-MM-DD (default: today)"
 *     responses:
 *       200:
 *         description: List of error logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to fetch logs
 */
router.get("/errors", getErrorLogs);

/**
 * @swagger
 * /logs/monthly-stats:
 *   get:
 *     summary: Get daily log stats for a given month
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 9
 *         required: false
 *         description: Month number (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2025
 *         required: false
 *         description: Year number (e.g. 2025)
 *     responses:
 *       200:
 *         description: Daily statistics for the selected month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       totalCalls:
 *                         type: number
 *                       successCalls:
 *                         type: number
 *                       errorCalls:
 *                         type: number
 *       500:
 *         description: Internal server error
 */
router.get("/monthly-stats", getMonthlyStats);

export default router;
