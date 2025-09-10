import Redis from "ioredis";

const redis = new Redis("redis://default:sLJ0ZrvFxnQv26LRalUynIUAJNUYuYJG@redis-14428.c82.us-east-1-2.ec2.redns.redis-cloud.com:14428");

const LOG_QUEUE_KEY = "log_queue";

async function pushLog() {
  const log = {
    service: "test-service",
    endpoint: "/api/test",
    method: "GET",
    status: 200,
    ip: "127.0.0.1",
    time: new Date().toISOString(),
  };

  await redis.rpush(LOG_QUEUE_KEY, JSON.stringify(log));
  console.log("✅ Pushed log:", log);

  const len = await redis.llen(LOG_QUEUE_KEY);
  console.log(`📦 Queue length now: ${len}`);
  process.exit(0);
}

pushLog();

