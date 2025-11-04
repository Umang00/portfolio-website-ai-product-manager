// config/mongodb.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI must be set in .env");
  process.exit(1);
}

// DB names from env (fallbacks if you leave them undefined)
const primaryDbName = process.env.MONGO_DB_NAME || "KartavyaPortfolioDB";
const aiDbName = process.env.MONGO_DB_NAME_AI || "KartavyaPortfolioDBAI";

const client = new MongoClient(uri, {
  // these driver options are no‑ops in v4+ but harmless
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbPrimary, dbAI;
let dbOpsCount = 0;
let dbOpsByCollection = {};

/**
 * Connects to Mongo once and sets up two Proxy‐wrapped Db instances.
 */
async function connectDB() {
  try {
    await client.connect();

    const rawPrimary = client.db(primaryDbName);
    const rawAI = client.db(aiDbName);

    function makeProxy(rawDb) {
      return new Proxy(rawDb, {
        get(target, prop) {
          if (prop === "collection") {
            return (collName, ...rest) => {
              const coll = target.collection(collName, ...rest);
              return new Proxy(coll, {
                get(cTarget, method) {
                  const orig = cTarget[method];
                  if (
                    typeof orig === "function" &&
                    [
                      "find",
                      "findOne",
                      "insertOne",
                      "insertMany",
                      "updateOne",
                      "updateMany",
                      "deleteOne",
                      "deleteMany",
                      "countDocuments",
                      "aggregate",
                    ].includes(method)
                  ) {
                    return (...args) => {
                      dbOpsCount++;
                      dbOpsByCollection[collName] =
                        (dbOpsByCollection[collName] || 0) + 1;
                      return orig.apply(cTarget, args);
                    };
                  }
                  return orig;
                },
              });
            };
          }
          return target[prop];
        },
      });
    }

    dbPrimary = makeProxy(rawPrimary);
    dbAI = makeProxy(rawAI);

    console.log(`✅ Connected to primary DB: ${primaryDbName}`);
    console.log(`✅ Connected to AI      DB: ${aiDbName}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

/**
 * Returns the proxied primary database instance.
 * @throws if connectDB() has not completed yet.
 */
function getDB() {
  if (!dbPrimary) {
    throw new Error(
      "Primary MongoDB not connected yet. Call connectDB() first."
    );
  }
  return dbPrimary;
}

/**
 * Returns the proxied AI database instance.
 * @throws if connectDB() has not completed yet.
 */
function getDBAI() {
  if (!dbAI) {
    throw new Error("AI MongoDB not connected yet. Call connectDB() first.");
  }
  return dbAI;
}

function getDBMetrics() {
  return { dbOpsCount, dbOpsByCollection };
}

function resetDBMetrics() {
  dbOpsCount = 0;
  dbOpsByCollection = {};
}

module.exports = {
  connectDB,
  getDB,
  getDBAI,
  getDBMetrics,
  resetDBMetrics,
  getPrimaryDBName: () => primaryDbName,
  getAIDBName: () => aiDbName,
};
