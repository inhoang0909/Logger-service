import Redis from "ioredis";

const redis = new Redis("redis://default:sLJ0ZrvFxnQv26LRalUynIUAJNUYuYJG@redis-14428.c82.us-east-1-2.ec2.redns.redis-cloud.com:14428");

const LOG_QUEUE_KEY = "log_queue";

async function startWorker() {
  console.log("🚀 Worker waiting for logs...");

  while (true) {
    const data = await redis.blpop(LOG_QUEUE_KEY, 0); // block until có log
    console.log("📥 BLPOP raw:", data);

    if (!data || !data[1]) continue;

    const log = JSON.parse(data[1]);
    console.log("✅ Received log:", log);
  }
}

startWorker();
