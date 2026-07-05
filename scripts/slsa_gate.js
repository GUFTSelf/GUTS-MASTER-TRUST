// scripts/slsa_gate.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_PATH = path.resolve(__dirname, "../evaluation-kit/output/evaluation_report.json");

console.log("\x1b[31m\x1b[1m=== VEK SLSA LEVEL 3 ENFORCEMENT GATE ===\x1b[0m");

if (!fs.existsSync(REPORT_PATH)) {
  console.error(`\x1b[31m[ERROR] Evaluation report not found at ${REPORT_PATH}. Build failed.\x1b[0m`);
  process.exit(1);
}

try {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  
  function evaluate(rpt) {
    const prov = rpt.build_provenance;
    const env = rpt.environment_evidence;
    
    let score = 1;

    // Check Level 2 Requirements: Provenance generation and file hashing
    const hasProvenance = prov && prov.build_hash;
    const hasHashes = rpt.integrity_evidence && rpt.integrity_evidence.trace_hash;

    if (hasProvenance && hasHashes) {
      score = 2;
    }

    // Check Level 3 Requirements: Isolated/containerized sandbox (ci context) + fully locked lockfile dependency hashing
    // Allow process.env.GITHUB_ACTIONS or dynamic containerized sandbox detection
    const isCI = env && (env.ci === "GitHub Actions" || process.env.GITHUB_ACTIONS);
    const isContainer = env && env.sandbox && env.sandbox.containerized;
    const hasLockfileHash = prov && prov.dependency_hash && prov.dependency_hash !== "hash_failed";

    if (score === 2 && isCI && isContainer && hasLockfileHash) {
      score = 3;
    }

    return score;
  }

  const level = evaluate(report);

  console.log(`  * Build Environment: \x1b[36m${report.environment_evidence?.ci || "Local"}\x1b[0m`);
  console.log(`  * Containerized Sandbox: \x1b[36m${report.environment_evidence?.sandbox?.containerized ? "YES" : "NO"}\x1b[0m`);
  console.log(`  * Achieved SLSA Score: \x1b[33m\x1b[1mLevel ${level}\x1b[0m`);

  // To allow developers to run builds locally while strictly enforcing Level 3 in automated CI/CD:
  const isContinuousIntegration = process.env.GITHUB_ACTIONS || report.environment_evidence?.ci === "GitHub Actions";

  if (isContinuousIntegration && level < 3) {
    console.error("\x1b[31m\x1b[1m[FAIL] CI/CD Gating Alert: SLSA LEVEL 3 REQUIRED FOR MAIN RELEASE — BUILD REJECTED!\x1b[0m");
    process.exit(1);
  } else if (level < 3) {
    console.warn("\x1b[33m[WARN] Local build warning: Gating bypassed because this is a Local-Shell execution. Level 3 requires GitHub Actions runtime.\x1b[0m");
    process.exit(0);
  } else {
    console.log("\x1b[32m\x1b[1m[PASS] SLSA Level 3 Gate Verified. Security posture aligned!\x1b[0m\n");
    process.exit(0);
  }
} catch (err) {
  console.error(`\x1b[31m[ERROR] SLSA Enforcement Gate run failed: ${err.message}\x1b[0m`);
  process.exit(1);
}
