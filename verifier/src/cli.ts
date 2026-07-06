#!/usr/bin/env tsx

import { verifyEPOFile } from "./verify";
import path from "path";

const args = process.argv.slice(2);

// Check if help is requested
if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log("\x1b[34m\x1b[1m┌────────────────────────────────────────────────────────┐\x1b[0m");
  console.log("\x1b[34m\x1b[1m│             VEK INDEPENDENT VERIFIER CLI               │\x1b[0m");
  console.log("\x1b[34m\x1b[1m└────────────────────────────────────────────────────────┘\x1b[0m");
  console.log("\n\x1b[33mUsage:\x1b[0m vek-verify --epo <path-to-epo-json-file>");
  console.log("Example: vek-verify --epo examples/sample_epo_v2.json");
  console.log("\nOptions:");
  console.log("  --epo, -e     Path to the Execution Proof Object JSON to verify [Required]");
  console.log("  --json, -j    Format output as pure machine-readable JSON");
  console.log("  --help, -h    Display this guidance");
  process.exit(0);
}

const epoIndex = args.indexOf("--epo") !== -1 ? args.indexOf("--epo") : args.indexOf("-e");
const jsonMode = args.includes("--json") || args.includes("-j");

if (epoIndex === -1 || !args[epoIndex + 1]) {
  console.error("\x1b[31m[ERROR] Missing required parameter: --epo <path>\x1b[0m");
  process.exit(1);
}

const epoPath = args[epoIndex + 1];

try {
  const result = verifyEPOFile(epoPath);

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === "VALID" ? 0 : 1);
  }

  // Beautiful human readable terminal formatting
  console.log("\x1b[34m\x1b[1m┌────────────────────────────────────────────────────────┐\x1b[0m");
  console.log("\x1b[34m\x1b[1m│             VEK OFFLINE VERIFIER REPORT                │\x1b[0m");
  console.log("\x1b[34m\x1b[1m└────────────────────────────────────────────────────────┘\x1b[0m");
  console.log(`Target: \x1b[36m${path.basename(epoPath)}\x1b[0m`);
  console.log(`Path  : \x1b[90m${epoPath}\x1b[0m\n`);

  console.log("Verification Pipeline Stages:");
  console.log(`  1. Schema Check                  : ${result.schemaMatch ? "\x1b[32m🟢 PASSED (v2.x dialect matches)\x1b[0m" : "\x1b[31m🔴 FAILED\x1b[0m"}`);
  console.log(`  2. Trace & Hash Re-execution    : ${result.traceRootMatch ? "\x1b[32m🟢 PASSED (identical replay)\x1b[0m" : "\x1b[31m🔴 FAILED (replay divergence)\x1b[0m"}`);
  console.log(`  3. Output State Verification     : ${result.outputMatch ? "\x1b[32m🟢 PASSED (bit-for-bit consensus)\x1b[0m" : "\x1b[31m🔴 FAILED\x1b[0m"}`);
  console.log(`  4. Cryptographic Signature Seal  : ${result.sealValid ? "\x1b[32m🟢 PASSED (HSM signature authentic)\x1b[0m" : "\x1b[31m🔴 FAILED\x1b[0m"}`);

  console.log("\nHash Comparison Registers:");
  console.log(`  * Expected State Hash: \x1b[35m${result.expectedFinalStateHash || "N/A"}\x1b[0m`);
  console.log(`  * Computed State Hash: \x1b[35m${result.recomputedFinalStateHash || "N/A"}\x1b[0m`);
  console.log(`  * Expected Proof Hash: \x1b[36m${result.expectedProofHash || "N/A"}\x1b[0m`);
  console.log(`  * Computed Proof Hash: \x1b[36m${result.recomputedProofHash || "N/A"}\x1b[0m`);

  console.log("\n\x1b[35m┌────────────────────────────────────────────────────────┐\x1b[0m");
  console.log(`│             FINAL AUDIT STATUS: ${result.status === "VALID" ? "\x1b[32m\x1b[1m🟢 VALID\x1b[0m" : "\x1b[31m\x1b[1m🔴 COMPROMISED\x1b[0m"}                 │`);
  console.log("\x1b[35m└────────────────────────────────────────────────────────┘\x1b[0m");
  
  if (result.status === "VALID") {
    console.log(`\x1b[32m\x1b[1m[SUCCESS] ${result.details}\x1b[0m\n`);
    process.exit(0);
  } else {
    console.error(`\x1b[31m\x1b[1m[FAILURE] ${result.details}\x1b[0m\n`);
    process.exit(1);
  }
} catch (err: any) {
  console.error(`\x1b[31m[CRASH] Verifier CLI crashed: ${err.message}\x1b[0m`);
  process.exit(1);
}
