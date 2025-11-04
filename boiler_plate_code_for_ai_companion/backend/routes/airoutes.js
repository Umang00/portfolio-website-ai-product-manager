// routes/aiRoutes.js
const {
    updateDbContextFile,
    updateGithubContextFile,
    updateResumeContextFile,
    buildMemoryIndex,
    askLLM,
    askWithRAG,
    // Add references to new controller functions:
    suggestFollowUpQuestions,
    snapshotMemoryUpdate,
    optimizeQuery,
  } = require("../controllers/aiContextManager");
  
  async function aiRoutes(fastify, options) {
    fastify.get("/", async (request, reply) => {
      return reply.send({ message: "AI Routes are working!" });
    });
  
    // Endpoint to manually trigger (re)creation of index and context updates
    fastify.route({
      method: ["GET", "POST"],
      url: "/create-index",
      handler: async (request, reply) => {
        try {
          // Regenerate all context files and the memory index
          await updateDbContextFile();
          await updateGithubContextFile();
          await updateResumeContextFile();
          // Force rebuild memory index to incorporate updated context
          await buildMemoryIndex(true);
          reply.send({
            message: "Context files updated and memory index built successfully.",
          });
        } catch (error) {
          console.error("Error creating index:", error);
          reply.code(500).send({ error: error.message });
        }
      },
    });
  
    // Endpoint to ask a question to the AI using the indexed context
    fastify.post("/ask-chat", async (request, reply) => {
      try {
        const { query } = request.body;
        if (!query || query.trim().length === 0) {
          return reply.code(400).send({ message: "Query cannot be empty." });
        }
        const answer = await askLLM(query);
        reply.send({ answer });
      } catch (error) {
        console.error("Error handling /ask-chat:", error);
        reply.code(500).send({ error: error.message });
      }
    });
  
    // **New** endpoint to get suggested follow-up questions
    fastify.post("/suggestFollowUpQuestions", async (request, reply) => {
      try {
        const { query, response, conversationMemory } = request.body;
        if (!query || !response) {
          return reply
            .code(400)
            .send({ error: "Both query and response are required." });
        }
        const suggestions = await suggestFollowUpQuestions(
          query,
          response,
          conversationMemory
        );
        reply.send({ suggestions });
      } catch (error) {
        console.error("Error handling /suggestFollowUpQuestions:", error);
        reply.code(500).send({ error: error.message });
      }
    });
  
    // **New** endpoint to update conversation memory snapshot
    fastify.post("/snapshotMemoryUpdate", async (request, reply) => {
      try {
        const { previousMemory, query, response } = request.body;
        if (!query || !response) {
          return reply.code(400).send({
            error: "Query and response are required for memory update.",
          });
        }
        const updatedMemory = await snapshotMemoryUpdate(
          previousMemory || "",
          query,
          response
        );
        reply.send({ memory: updatedMemory });
      } catch (error) {
        console.error("Error handling /snapshotMemoryUpdate:", error);
        reply.code(500).send({ error: error.message });
      }
    });
  
    // New endpoint:
    fastify.post("/optimize-query", async (request, reply) => {
      try {
        const { query, conversationMemory } = request.body;
        if (!query) {
          return reply.code(400).send({ error: "Query is required." });
        }
        const optimizedQuery = await optimizeQuery(
          conversationMemory || "",
          query
        );
        reply.send({ optimizedQuery });
      } catch (err) {
        console.error("Error /optimize-query:", err);
        reply.code(500).send({ error: err.message });
      }
    });
  }
  
  module.exports = aiRoutes;
  