import client from 'prom-client';


client.collectDefaultMetrics();

export const httpRequestCounter = new client.Counter({
name: `${process.env.PROMETHEUS_PREFIX || 'logger_service'}_http_requests_total`,
help: 'Total number of HTTP requests handled by services',
labelNames: ['service', 'method', 'endpoint', 'status']
});


export const httpRequestDuration = new client.Histogram({
name: `${process.env.PROMETHEUS_PREFIX || 'logger_service'}_http_request_duration_ms`,
help: 'Duration of HTTP requests in ms',
labelNames: ['service', 'method', 'endpoint', 'status'],
buckets: [50,100,200,500,1000,2000,5000]
});


import express from 'express';
const router = express.Router();


router.get('/metrics', async (req, res) => {
res.set('Content-Type', client.register.contentType);
res.end(await client.register.metrics());
});


export default router;