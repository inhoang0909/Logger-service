import swaggerJSDoc from "swagger-jsdoc";

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
        url: `http://0.0.0.0:4000`, 
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
