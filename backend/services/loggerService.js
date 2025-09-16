import Log from "../models/Log.js";

export const createLogDirectService = async (logData) => {
  const {
    service, endpoint, method, status,
    ip, duration, errorMessage, errorStack, payload,
  } = logData;

  const log = await Log.create({
    service,
    endpoint,
    method,
    status,
    ip,
    duration,
    date: new Date().toISOString().slice(0, 10),
    error: {
      message: errorMessage || null,
      stack: errorStack || null,
      payload: payload || null,
    },
    createdAt: new Date(),
  });

  return log;
};

export const getLogStatsService = async () => {
  return Log.aggregate([
    {
      $group: {
        _id: {
          service: "$service",
          endpoint: "$endpoint",
          method: "$method",
          status: "$status",
          ip: "$ip",
          date: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M",
              date: "$updatedAt",
              timezone: "Asia/Ho_Chi_Minh",
            },
          },
        },
        totalCalls: { $sum: 1 },
        successCalls: { $sum: { $cond: [{ $lt: ["$status", 400] }, 1, 0] } },
        errorCalls: { $sum: { $cond: [{ $gte: ["$status", 400] }, 1, 0] } },
      },
    },
    { $sort: { "_id.date": -1 } },
  ]);
};

export const getMonthlyStatsService = async (month, year) => {
  const now = new Date();
  const targetMonth = parseInt(month) || now.getMonth() + 1;
  const targetYear = parseInt(year) || now.getFullYear();

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  return Log.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Ho_Chi_Minh",
            },
          },
        },
        totalCalls: { $sum: 1 },
        successCalls: { $sum: { $cond: [{ $lt: ["$status", 400] }, 1, 0] } },
        errorCalls: { $sum: { $cond: [{ $gte: ["$status", 400] }, 1, 0] } },
      },
    },
    {
      $project: {
        date: "$_id.date",
        totalCalls: 1,
        successCalls: 1,
        errorCalls: 1,
        _id: 0,
      },
    },
    { $sort: { date: 1 } },
  ]);
};
