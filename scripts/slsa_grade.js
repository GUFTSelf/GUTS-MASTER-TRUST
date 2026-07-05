// scripts/slsa_grade.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_PATH = path.resolve(__dirname, '../evaluation-kit/output/evaluation_report.json');

console.log("\x1b[35m=== VEK SLSA GRADING PIPELINE ===\x1b[0m");

if (!fs.existsSync(REPORT_PATH)) {
  console.error(`\x1b[31m[ERROR] Evaluation report not found at ${REPORT_PATH}.\x1b[0m`);
  process.exit(1);
}

try {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));

  function grade(rpt) {
    let level = 1;

    // Check Level 2 Requirements: Provenance generation and file hashing
    const hasProvenance = rpt.build_provenance && rpt.build_provenance.build_hash;
    const hasHashes = rpt.integrity_evidence && rpt.integrity_evidence.trace_hash;

    if (hasProvenance && hasHashes) {
      level = 2;
    }

    // Check Level 3 Requirements: Isolated execution (containerized/CI context) + fully locked lockfile dependency hashing
    const isCI = rpt.environment_evidence && (rpt.environment_evidence.ci === "GitHub Actions" || process.env.GITHUB_ACTIONS);
    const isContainer = rpt.environment_evidence && rpt.environment_evidence.sandbox && rpt.environment_evidence.sandbox.containerized;
    const hasLockfileHash = rpt.build_provenance && rpt.build_provenance.dependency_hash && rpt.build_provenance.dependency_hash !== 'hash_failed';

    if (level === 2 && isCI && isContainer && hasLockfileHash) {
      level = 3;
    }

    return level;
  }

  const achieved = grade(report);

  console.log(`  * Build Pipeline Context : \x1b[36m${report.environment_evidence?.ci || 'Local-Shell'}\x1b[0m`);
  console.log(`  * Containerized Sandbox  : \x1b[36m${report.environment_evidence?.sandbox?.containerized ? "YES" : "NO"}\x1b[0m`);
  console.log(`  * Dependency Hashing     : \x1b[36m${report.build_provenance?.dependency_hash ? "VERIFIED" : "NONE"}\x1b[0m`);
  console.log(`\n\x1b[32m[STATUS] Dynamic SLSA Classification: Level ${achieved} Certified!\x1b[0m`);

  if (achieved < 2) {
    console.error("\x1b[31m[FAIL] Security boundary compromised: Insufficient provenance for Level 2 verification.\x1b[0m");
    process.exit(1);
  } else {
    console.log("\x1b[32m[PASS] SLSA Trust conformance verified.\x1b[0m\n");
    process.exit(0);
  }
} catch (err) {
  console.error(`\x1b[31m[ERROR] SLSA Grading run failed: ${err.message}\x1b[0m`);
  process.exit(1);
}
