import mongoose from "mongoose";
import dns from "node:dns";
import logger from "../utils/logger.js";
import config from "../config/index.js";

const maskMongoUri = (uri = "") =>
  uri.replace(/\/\/([^:@]+):([^@]+)@/, "//$1:****@");

const configureMongoDnsResolvers = () => {
  const uri = config.mongodb.uri || process.env.MONGODB_URI || "";
  const isSrvUri = uri.startsWith("mongodb+srv://");
  if (!isSrvUri) return;

  const envServers = process.env.MONGODB_DNS_SERVERS;
  const servers = (envServers || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!servers.length) return;

  try {
    dns.setServers(servers);
    logger.info(`MongoDb SRV DNS resolvers set to: ${servers.join(", ")}`);
  } catch (error) {
    logger.warn(`Unable to set MongoDb DNS resolvers: ${error.message}`);
  }
};

const connect = async () => {
  configureMongoDnsResolvers();

  const primaryUri = config.mongodb.uri || process.env.MONGODB_URI?.trim();
  const fallbackUri = process.env.MONGODB_URI_DIRECT?.trim();

  if (!primaryUri && !fallbackUri) {
    logger.error(
      "MongoDb connection error: MONGODB_URI (or MONGODB_URI_DIRECT) is not defined",
    );
    process.exit(1);
  }

  const candidates = [primaryUri, fallbackUri].filter(Boolean);
  const errors = [];

  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      logger.info(`MongoDb connected successfully using ${maskMongoUri(uri)}`);
      return;
    } catch (error) {
      errors.push({ uri: maskMongoUri(uri), message: error.message });
      logger.warn(
        `MongoDb connection failed for ${maskMongoUri(uri)}: ${error.message}`,
      );
    }
  }

  logger.error("MongoDb connection error: all configured URIs failed", {
    attempts: errors,
    hint: "If mongodb+srv DNS fails (ECONNREFUSED/querySrv), set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 and/or add MONGODB_URI_DIRECT in server/.env using Atlas standard (non-SRV) URI.",
  });
  process.exit(1);
};

export default connect;
