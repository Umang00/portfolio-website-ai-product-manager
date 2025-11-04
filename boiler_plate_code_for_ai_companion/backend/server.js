// server.js
const os = require("os");
const fastify = require("fastify");
const dotenv = require("dotenv");
const useragent = require("express-useragent");

dotenv.config();

const { connectDB, getDBMetrics, resetDBMetrics } = require("./config/mongodb");

const app = fastify({ logger: false, bodyLimit: 50 * 1024 * 1024 });

// CORS, Cookies, Formbody
app.register(require("@fastify/cors"), {
  origin: [
    "https://kartavya-portfolio-mern-frontend.onrender.com",
    "https://kartavya-singh.com",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// set no-store for any /api/* response
app.addHook("onSend", (req, reply, payload, done) => {
  if (req.raw.url.startsWith("/api")) {
    reply.header("Cache-Control", "no-store");
  }
  done(null, payload);
});

app.register(require("@fastify/cookie"), {
  cookie: { path: "/", secure: true, httpOnly: true, sameSite: "none" },
});
app.register(require("@fastify/formbody"));

// Metrics state
let totalApiCalls = 0;
let uniqueIPs = new Set();
let memorySumRSS = 0,
  memorySumHeapUsed = 0,
  memorySumHeapTotal = 0,
  memorySampleCount = 0;
let routeStats = {};
let prevCpuUsage = process.cpuUsage();

// Request/Response hooks for metrics
app.addHook("onRequest", (req, reply, done) => {
  req.startTime = process.hrtime.bigint();
  done();
});
app.addHook("onResponse", (req, reply, done) => {
  const elapsed = process.hrtime.bigint() - req.startTime;
  const latMs = Number(elapsed) / 1e6;
  totalApiCalls++;
  uniqueIPs.add(req.ip);

  const ua = useragent.parse(req.headers["user-agent"] || "");
  const route = req.routerPath || req.raw.url;
  routeStats[route] = routeStats[route] || {
    count: 0,
    methods: new Set(),
    statusCodes: new Set(),
    ips: new Set(),
    devices: new Set(),
    browsers: new Set(),
    totalLatency: 0,
  };
  const st = routeStats[route];
  st.count++;
  st.methods.add(req.method);
  st.statusCodes.add(reply.statusCode);
  st.ips.add(req.ip);
  st.devices.add(ua.platform || "Unknown");
  st.browsers.add(ua.browser || "Unknown");
  st.totalLatency += latMs;

  const mem = process.memoryUsage();
  memorySumRSS += mem.rss;
  memorySumHeapUsed += mem.heapUsed;
  memorySumHeapTotal += mem.heapTotal;
  memorySampleCount++;
  done();
});

// Global endpoints
app.get("/", (req, reply) =>
  reply.send("Welcome to Kartavya's MERN Portfolio Backend")
);
app.get("/api", (req, reply) =>
  reply.send("This is the API track for Kartavya's MERN Portfolio Backend.")
);

// Error handler
app.setErrorHandler((err, req, reply) => {
  console.error(err.stack);
  reply.code(500).send({ error: "Internal Server Error" });
});

// Hourly metrics dump
setInterval(async () => {
  try {
    const avgRSS = memorySampleCount ? memorySumRSS / memorySampleCount : 0;
    const avgHeap = memorySampleCount
      ? memorySumHeapUsed / memorySampleCount
      : 0;
    const totalHeap = memorySampleCount
      ? memorySumHeapTotal / memorySampleCount
      : 0;
    const rssPct = os.totalmem()
      ? ((avgRSS / os.totalmem()) * 100).toFixed(2)
      : "0.00";
    const heapPct = totalHeap
      ? ((avgHeap / totalHeap) * 100).toFixed(2)
      : "0.00";
    const cpuNow = process.cpuUsage();
    const userDelta = cpuNow.user - prevCpuUsage.user;
    const sysDelta = cpuNow.system - prevCpuUsage.system;
    const cpuPct = (((userDelta + sysDelta) / 1e6 / 3600) * 100).toFixed(2);
    prevCpuUsage = cpuNow;

    const handles = process._getActiveHandles().length;
    const uptimeSec = process.uptime().toFixed(0);

    // DB metrics
    const dbMet = getDBMetrics();
    let conn = "N/A",
      dbUp = "N/A",
      stor = "N/A";
    try {
      const db = require("./config/mongodb").getDB();
      const admin = db.admin();
      const stat = await admin.serverStatus();
      conn = stat.connections?.current ?? conn;
      dbUp = stat.uptime ?? dbUp;
      const s = await db.stats();
      const totMB = Math.round((s.storageSize || 0) / (1024 * 1024));
      const usedMB = Math.round((s.dataSize || 0) / (1024 * 1024));
      stor = `${totMB - usedMB}MB/${totMB}MB`;
    } catch {}
    let topC = null,
      maxOps = 0;
    for (const [c, o] of Object.entries(dbMet.dbOpsByCollection)) {
      if (o > maxOps) {
        maxOps = o;
        topC = c;
      }
    }

    console.log("----- Hourly Metrics -----");
    console.log(
      `API Calls:${totalApiCalls} | RSS:${rssPct}% | Heap:${heapPct}% | CPU:${cpuPct}% | Handles:${handles} | Uptime:${uptimeSec}s`
    );
    console.log(
      `DB Conns:${conn} | Ops:${dbMet.dbOpsCount} | DB Uptime:${dbUp}s | Storage:${stor}` +
        (topC ? ` | TopColl:${topC}(${maxOps})` : "")
    );
    console.log("Endpoints:");
    if (!Object.keys(routeStats).length) {
      console.log("  (no calls)");
    } else {
      console.log(
        "Route".padEnd(30) +
          "Cnt".padEnd(5) +
          "Methods".padEnd(12) +
          "Sts".padEnd(5) +
          "IPs".padEnd(4) +
          "Dev".padEnd(10) +
          "Brw".padEnd(10) +
          "AvgLat"
      );
      for (const [r, st] of Object.entries(routeStats)) {
        console.log(
          r.padEnd(30) +
            String(st.count).padEnd(5) +
            Array.from(st.methods).join(",").padEnd(12) +
            Array.from(st.statusCodes).join(",").padEnd(5) +
            String(st.ips.size).padEnd(4) +
            Array.from(st.devices).join(",").padEnd(10) +
            Array.from(st.browsers).join(",").padEnd(10) +
            `${(st.totalLatency / st.count).toFixed(2)}`
        );
      }
    }
  } catch (e) {
    console.error("Hourly log error:", e);
  } finally {
    totalApiCalls = 0;
    uniqueIPs.clear();
    memorySumRSS =
      memorySumHeapUsed =
      memorySumHeapTotal =
      memorySampleCount =
        0;
    routeStats = {};
    resetDBMetrics();
  }
}, 3600 * 1000);

// Startup
(async () => {
  try {
    await connectDB();
    // now that both DBs are ready, mount your routes and AI
    const dataRoutes = require("./routes/dataRoutes");
    app.register(dataRoutes, { prefix: "/api" });

    const aiRoutes = require("./routes/aiRoutes");
    app.register(aiRoutes, { prefix: "/api/ai" });

    const imagesRoutes = require("./routes/imagesRoutes");
    app.register(imagesRoutes, { prefix: "/api/images" });

    const aiContextManager = require("./controllers/aiContextManager");
    await aiContextManager.initContext();
    console.log("✅ AI context initialized");

    const PORT = process.env.PORT || 5000;
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Server listening on port ${PORT}`);
  } catch (err) {
    console.error("❌ Startup failure:", err);
    process.exit(1);
  }
})();
