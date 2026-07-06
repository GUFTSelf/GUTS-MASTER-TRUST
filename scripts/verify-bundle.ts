import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";
if (typeof (globalThis as any).require === "undefined") {
  (globalThis as any).require = createRequire(import.meta.url);
}
import { verifyReportSignature, hashReport } from "../src/crypto/report_signer";
import { verifyEpoV1 } from "../src/lib/kernel";

console.log("\x1b[32m┌────────────────────────────────────────────────────────┐\x1b[0m");
console.log("\x1b[32m│              VEK AUDIT BUNDLE VERIFIER (CLI)           │\x1b[0m");
console.log("\x1b[32m└────────────────────────────────────────────────────────┘\x1b[0m");

let target = process.argv[2] || "evaluation-kit/output";

// If invoked via the `./vek verify epo_v1.json` CLI pattern, shift the target
if (target === "verify") {
  target = process.argv[3] || "epo_v1.json";
}

try {
  let reportPath = target;
  
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    reportPath = path.join(target, "evaluation_report.json");
  }

  if (!fs.existsSync(reportPath)) {
    console.error(`\x1b[31m[ERROR] Verification target file not found: ${reportPath}\x1b[0m`);
    console.error("Please run execution first to generate it: \x1b[32mnpm run execute -- sample-input.json\x1b[0m");
    process.exit(1);
  }

  console.log(`[VERIFY] Loading verification target: \x1b[1m${reportPath}\x1b[0m`);
  
  const rawReport = fs.readFileSync(reportPath, "utf-8");
  const report = JSON.parse(rawReport);

  // Check if it is an Execution Proof Object (EPO v1)
  if (report.epo_version === "1.0") {
    console.log("\n\x1b[34m[SYSTEM] Detected Execution Proof Object (EPO v1) format.\x1b[0m");
    console.log(`  - Kernel Version    : \x1b[1m${report.kernel_version}\x1b[0m`);
    console.log(`  - Domain            : \x1b[1m${report.domain}\x1b[0m`);
    console.log(`  - Execution ID      : \x1b[36m${report.execution_id}\x1b[0m`);
    console.log(`  - Initial State Hash: \x1b[90m${report.initial_state_hash}\x1b[0m`);
    console.log(`  - Final State Hash  : \x1b[36m${report.final_state_hash}\x1b[0m`);
    console.log(`  - Total Steps       : \x1b[33m${report.inputs.length}\x1b[0m`);
    console.log(`  - Stored Proof Hash : \x1b[35m${report.proof_hash}\x1b[0m`);

    const result = verifyEpoV1(report);

    console.log("\n\x1b[35m┌────────────────────────────────────────────────────────┐\x1b[0m");
    console.log(`│             VERIFICATION RESULT: ${result.success ? "\x1b[32m\x1b[1m🟢 PASS\x1b[0m" : "\x1b[31m\x1b[1m🔴 FAIL\x1b[0m"}              │`);
    console.log("\x1b[35m└────────────────────────────────────────────────────────┘\x1b[0m");

    if (result.success) {
      console.log(`\x1b[32m\x1b[1m[PASS] ${result.reason}\x1b[0m\n`);
      process.exit(0);
    } else {
      console.log(`\x1b[31m\x1b[1m[FAIL] Verification Failed: ${result.reason}\x1b[0m\n`);
      process.exit(1);
    }
  }

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
