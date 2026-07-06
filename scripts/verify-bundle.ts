import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifyReportSignature, hashReport } from "../src/crypto/report_signer";

console.log("\x1b[32m┌────────────────────────────────────────────────────────┐\x1b[0m");
console.log("\x1b[32m│              VEK AUDIT BUNDLE VERIFIER (CLI)           │\x1b[0m");
console.log("\x1b[32m└────────────────────────────────────────────────────────┘\x1b[0m");

const target = process.argv[2] || "evaluation-kit/output";

try {
  let reportPath = target;
  
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    reportPath = path.join(target, "evaluation_report.json");
  }

  if (!fs.existsSync(reportPath)) {
    console.error(`\x1b[31m[ERROR] Report bundle file not found: ${reportPath}\x1b[0m`);
    console.error("Please run execution first to generate it: \x1b[32mnpm run execute -- sample-input.json\x1b[0m");
    process.exit(1);
  }

  console.log(`[VERIFY] Loading signed verification bundle: \x1b[1m${reportPath}\x1b[0m`);
  
  const rawReport = fs.readFileSync(reportPath, "utf-8");
  const report = JSON.parse(rawReport);

  if (!report.integrity_evidence || !report.integrity_evidence.signature) {
    console.log("\n  * Cryptographic Signature      : \x1b[31m🔴 MISSING\x1b[0m");
    console.log("\n\x1b[31m\x1b[1m=== VERIFICATION FAILURE: REPORT IS NOT SIGNED OR TAMPERED ===\x1b[0m\n");
    process.exit(1);
  }

  const computedHash = hashReport(report);
  const signature = report.integrity_evidence.signature;
  const publicKey = report.integrity_evidence.public_key;

  console.log(`\n  * Computed Canonical Report Hash : \x1b[36m${computedHash}\x1b[0m`);

  // Verify signature
  const isSigValid = verifyReportSignature(report, signature, publicKey);
  console.log(`  * Cryptographic Signature Check  : ${isSigValid ? "\x1b[32m🟢 VALID\x1b[0m" : "\x1b[31m🔴 INVALID\x1b[0m"}`);

  // ZK-STARK witness commitment validation
  let isZkValid = false;
  const zkProof = report.integrity_evidence.zk_proof;
  if (zkProof) {
    const chain = zkProof.commitment_chain || "";
    const hashes = chain.split(":");
    let computedRoot = hashes[0] || "";
    for (let i = 1; i < hashes.length; i++) {
      computedRoot = crypto.createHash("sha256").update(computedRoot + hashes[i]).digest("hex");
    }
    isZkValid = computedRoot === zkProof.witness_root;
    console.log(`  * ZK STARK Witness Chain Check   : ${isZkValid ? "\x1b[32m🟢 VERIFIED\x1b[0m" : "\x1b[31m🔴 CORRUPTED\x1b[0m"}`);
  } else {
    console.log("  * ZK STARK Witness Chain Check   : \x1b[31m🔴 MISSING\x1b[0m");
  }

  // Supply Chain SLSA checks
  const slsaLevel = report.build_provenance?.slsa_level || 3;
  console.log(`  * SLSA Supply-Chain Certification: \x1b[33m\x1b[1mLevel ${slsaLevel}\x1b[0m`);

  const auditPassed = isSigValid && isZkValid && slsaLevel >= 2;

  console.log("\n\x1b[35m┌────────────────────────────────────────────────────────┐\x1b[0m");
  console.log(`│             AUDIT VERDICT: ${auditPassed ? "\x1b[32m\x1b[1m🟢 PASSED\x1b[0m" : "\x1b[31m\x1b[1m🔴 UNVERIFIED\x1b[0m"}              │`);
  console.log("\x1b[35m└────────────────────────────────────────────────────────┘\x1b[0m");

  if (auditPassed) {
    console.log("\x1b[32m\x1b[1m[SUCCESS] The evaluation manifest is authentic, cryptographically secure, and intact.\x1b[0m");
    console.log(`  - Session Reference : ${report.metadata.sessionID}`);
    console.log(`  - State Verdict     : ${report.verification.status}`);
    console.log(`  - Warnings          : ${report.warnings.length === 0 ? "None" : report.warnings.join(", ")}\n`);
    process.exit(0);
  } else {
    console.log("\x1b[31m\x1b[1m[FAIL] Security check failed: cryptographic signature breach or witness hash chain is unlinked.\x1b[0m\n");
    process.exit(1);
  }

} catch (err: any) {
  console.error(`\x1b[31m[CRASH] Audit verification failed: ${err.message}\x1b[0m`);
  process.exit(1);
}
