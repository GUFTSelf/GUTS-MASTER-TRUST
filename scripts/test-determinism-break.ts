import fs from "fs";
import path from "path";
import { createRequire } from "module";
if (typeof (globalThis as any).require === "undefined") {
  (globalThis as any).require = createRequire(import.meta.url);
}
import { verifyEpoV1, executeVek, canonicalJsonStringify, sha256Sync } from "../src/lib/kernel";

console.log("\x1b[35m┌────────────────────────────────────────────────────────┐\x1b[0m");
console.log("\x1b[35m│             VEK DETERMINISM KILL-TEST SUITE            │\x1b[0m");
console.log("\x1b[35m└────────────────────────────────────────────────────────┘\x1b[0m");

const goldenEpoPath = "examples/golden_run/epo.json";
const goldenInputPath = "examples/golden_run/input.json";

if (!fs.existsSync(goldenEpoPath) || !fs.existsSync(goldenInputPath)) {
  console.error("\x1b[31m[ERROR] Golden run artifacts missing. Please run: ./vek run examples/golden_run\x1b[0m");
  process.exit(1);
}

const rawEpo = fs.readFileSync(goldenEpoPath, "utf-8");
const baseEpo = JSON.parse(rawEpo);

const rawInput = fs.readFileSync(goldenInputPath, "utf-8");
const baseInput = JSON.parse(rawInput);

let passedTests = 0;
let totalTests = 4;

// --- Test 1: Change 1 byte / 1 field in EPO input/trace -> verify must FAIL ---
console.log("\x1b[33m[TEST 1] Modifying 1 byte in Portable Truth Container (EPO)... \x1b[0m");
const tamperedEpo1 = JSON.parse(JSON.stringify(baseEpo));
// Tamper with domain string by adding a character
tamperedEpo1.domain = tamperedEpo1.domain + "x";

const verificationResult1 = verifyEpoV1(tamperedEpo1);
if (!verificationResult1.success) {
  console.log("\x1b[32m  🟢 PASS: Tamper detected! Reason: " + verificationResult1.reason + "\x1b[0m");
  passedTests++;
} else {
  console.error("\x1b[31m  🔴 FAIL: Verification succeeded despite tampered data!\x1b[0m");
}

// --- Test 2: Modify payload value or order of JSON keys -> verify must FAIL ---
console.log("\n\x1b[33m[TEST 2] Modifying JSON representation or internal trace step values... \x1b[0m");
const tamperedEpo2 = JSON.parse(JSON.stringify(baseEpo));
// Tamper with the state hash of the first trace step
if (tamperedEpo2.trace && tamperedEpo2.trace[0]) {
  tamperedEpo2.trace[0].state_hash = "0x" + "f".repeat(64);
}

const verificationResult2 = verifyEpoV1(tamperedEpo2);
if (!verificationResult2.success) {
  console.log("\x1b[32m  🟢 PASS: State divergence or payload tamper successfully caught! Reason: " + verificationResult2.reason + "\x1b[0m");
  passedTests++;
} else {
  console.error("\x1b[31m  🔴 FAIL: Trace validation did not fail on altered state hash!\x1b[0m");
}

// --- Test 3: Re-run on same seed twice -> must match EXACTLY ---
console.log("\n\x1b[33m[TEST 3] Running dual identical executions from same seed... \x1b[0m");
const run1 = executeVek(
  baseInput.domain,
  baseInput.inputs,
  baseInput.seed,
  baseInput.instructions,
  "none"
);

const run2 = executeVek(
  baseInput.domain,
  baseInput.inputs,
  baseInput.seed,
  baseInput.instructions,
  "none"
);

const hash1 = run1.epo?.proof_hash;
const hash2 = run2.epo?.proof_hash;

if (hash1 && hash2 && hash1 === hash2) {
  console.log("\x1b[32m  🟢 PASS: Re-runs matched exactly bit-for-bit!\x1b[0m");
  console.log(`    - Run 1 Proof Hash: \x1b[36m${hash1}\x1b[0m`);
  console.log(`    - Run 2 Proof Hash: \x1b[36m${hash2}\x1b[0m`);
  passedTests++;
} else {
  console.error("\x1b[31m  🔴 FAIL: Dual runs did not produce identical hashes!\x1b[0m");
}

// --- Test 4: Tampering with cryptographic signature / public key seal -> verify must FAIL ---
console.log("\n\x1b[33m[TEST 4] Tampering with Cryptographic Signature / Public Key Seal... \x1b[0m");
const tamperedEpo4 = JSON.parse(JSON.stringify(baseEpo));
if (tamperedEpo4.signature) {
  if (typeof tamperedEpo4.signature === "object" && tamperedEpo4.signature !== null) {
    const sigLen = tamperedEpo4.signature.signature.length;
    const lastChar = tamperedEpo4.signature.signature[sigLen - 1];
    const newChar = lastChar === "a" ? "b" : "a";
    tamperedEpo4.signature.signature = tamperedEpo4.signature.signature.substring(0, sigLen - 1) + newChar;
  } else if (typeof tamperedEpo4.signature === "string") {
    // Flip the last character of the signature string to invalidate it
    const sigLen = tamperedEpo4.signature.length;
    const lastChar = tamperedEpo4.signature[sigLen - 1];
    const newChar = lastChar === "a" ? "b" : "a";
    tamperedEpo4.signature = tamperedEpo4.signature.substring(0, sigLen - 1) + newChar;
  }
}

const verificationResult4 = verifyEpoV1(tamperedEpo4);
if (!verificationResult4.success) {
  console.log("\x1b[32m  🟢 PASS: Tampered signature successfully detected and rejected! Reason: " + verificationResult4.reason + "\x1b[0m");
  passedTests++;
} else {
  console.error("\x1b[31m  🔴 FAIL: Verification succeeded despite tampered cryptographic signature seal!\x1b[0m");
}

console.log("\n\x1b[35m┌────────────────────────────────────────────────────────┐\x1b[0m");
console.log(`│             OVERALL STATUS: ${passedTests === 4 ? "\x1b[32m\x1b[1mALL TESTS PASSED\x1b[0m" : "\x1b[31m\x1b[1mFAILURES DETECTED\x1b[0m"}              │`);
console.log("\x1b[35m└────────────────────────────────────────────────────────┘\x1b[0m\n");

if (passedTests === 4) {
  process.exit(0);
} else {
  process.exit(1);
}
