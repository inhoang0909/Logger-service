import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    service: { type: String, default: "logger-service" },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    status: { type: Number, required: true },
    ip: { type: String },
    count: { type: Number, default: 1 },
    duration: { type: Number }, 
    date: { type: String },    
    error: {
      message: { type: String },
      stack: { type: String },
      payload: { type: mongoose.Schema.Types.Mixed }, 
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Log", logSchema);
