import redisClient  from "../config/redis.js";

const LOG_QUEUE_KEY = process.env.LOG_QUEUE_KEY || "log_queue";

const loggerMiddleware = (req, res, next) => {
  const skipPaths = ["/", "/favicon.ico", "/health", "/metrics"];
  if (req.originalUrl.startsWith("/logs") || skipPaths.includes(req.originalUrl)) return next();

  const startTime = Date.now();
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown-ip";

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      time: new Date().toISOString(),
      durationMs: duration,
      ip: clientIp,
      service: req.headers["x-source-service"] || "unknown-service",
      endpoint: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      payload: req.body && Object.keys(req.body).length < 20 ? req.body : null,
      errorMessage: res.locals.errorMessage || null,
      errorStack: res.locals.errorStack || null,
    };

    // Fire-and-forget
    redisClient.rpush(LOG_QUEUE_KEY, JSON.stringify(logEntry))
      .then(() => console.log(`✅ Log pushed to ${LOG_QUEUE_KEY}`))
      .catch(err => console.error("❌ Failed to push log:", err.message));
  });

  next();
};

export default loggerMiddleware;
