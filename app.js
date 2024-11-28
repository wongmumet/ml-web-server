const Hapi = require("@hapi/hapi");
const { loadModel, predict } = require("./inference");

(async () => {
  // Load model
  const model = await loadModel();
  console.log("Model loaded!");

  // Initialize server
  const server = Hapi.server({
    host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    port: 3000,
  });

  // Setup route
  server.route({
    method: "POST",
    path: "/predicts",
    handler: async (request) => {
      const { image } = request.payload;
      const predictions = await predict(model, image);
      const [paper, rock] = predictions;

      if (paper) {
        return { result: "paper" };
      }

      if (rock) {
        return { result: "rock" };
      }

      return { result: "scissors" };
    },
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
      },
    },
  });

  // Start server
  await server.start();
  console.log(`Server started at: ${server.info.uri}`);
})();
