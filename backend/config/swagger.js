import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Logger API Documentation",
      version: "1.0.0",
      description: "API for logging services",
    },
    servers: [
      {
        url: `http://0.0.0.0:${PORT}`, 
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📘 Swagger docs available at http://0.0.0.0:${PORT}/api-docs`);

  console.log("Swagger loaded paths:", Object.keys(swaggerSpec.paths));
};

export default setupSwagger;
