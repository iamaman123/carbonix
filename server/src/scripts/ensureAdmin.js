/**
 * One-off: set drizzleahuja18@gmail.com to admin; migrate legacy BOTH → PRODUCER.
 * Usage (from server/): node src/scripts/ensureAdmin.js
 * Loads env via ../config/index.js (same as the API).
 */
import mongoose from "mongoose";
import config from "../config/index.js";

const ADMIN_EMAIL = "drizzleahuja18@gmail.com";

async function run() {
  const uri = config.mongodb?.uri;
  if (!uri) {
    console.error("Missing MONGODB_URI in .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const raw = mongoose.connection.collection("users");

  const adminRes = await raw.updateOne(
    { email: ADMIN_EMAIL },
    { $set: { role: "admin" } },
  );
  console.log("Admin update:", adminRes.matchedCount, "matched,", adminRes.modifiedCount, "modified");

  const bothRes = await raw.updateMany({ role: "BOTH" }, { $set: { role: "PRODUCER" } });
  console.log("Migrated BOTH → PRODUCER:", bothRes.modifiedCount);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
