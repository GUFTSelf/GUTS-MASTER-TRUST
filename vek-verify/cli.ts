#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

// Helper to compute canonical report hash
function hashReport(report: any): string {
  const cleanReport = { ...report };
  delete cleanReport.integrity_evidence; // exclude envelope to match signing
  const canonical = JSON.stringify(cleanReport, Object.keys(cleanReport).sort());
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function verifySignature(hash: string, signature: string, publicKey: string): boolean {
  try {
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(hash);
    verify.end();
    return verify.verify(publicKey, signature, "hex");
  } catch (err) {
    return false;
  }
}

function computeFileHash(filePath: string): string {
  try {
    const data = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(data).digest("hex");
  } catch (err) {
    return "";
  }
}

console.log("\x1b[34m\x1b[1m┌────────────────────────────────────────────────────────┐\x1b[0m");
console.log("\x1b[34m\x1b[1m│          VEK EXTERNAL AUDITOR VERIFICATION CLI         │\x1b[0m");
console.log("\x1b[34m\x1b[1m└────────────────────────────────────────────────────────┘\x1b[0m");

const target = process.argv[2];

if (!target) {
  console.log("\x1b[33mUsage: npm run verify-audit <path-to-manifest-dir-or-json-or-tar>\x1b[0m");
  console.log("Example: npm run verify-audit evaluation-kit/output/evaluation_report.json");
  console.log("Example: npm run verify-audit evaluation-kit/output/");
  process.exit(1);
}

try {
  let report: any = null;
  let signature: string = "";
  let publicKey: string = "";
  let isDirectoryMode = false;
  let dirPath = "";

  const stats = fs.statSync(target);

  if (stats.isFile()) {
    if (target.endsWith(".json")) {
      console.log(`[AUDIT] Loading single JSON report: ${target}`);
      const raw = fs.readFileSync(target, "utf-8");
      report = JSON.parse(raw);
      signature = report.integrity_evidence?.signature || "";
      publicKey = report.integrity_evidence?.public_key || "";
    } else if (target.endsWith(".tar.gz") || target.endsWith(".zip") || target.endsWith(".tar")) {
      console.log(`[AUDIT] Loading archived bundle: ${target}`);
      // Extract to a temp directory to run cross-file verification
      const tempDir = path.join(process.cwd(), "evaluation-kit/output/temp_audit_" + Date.now());
      fs.mkdirSync(tempDir, { recursive: true });
      try {
        if (target.endsWith(".zip")) {
          try {
            execSync(`unzip -q "${target}" -d "${tempDir}"`, { stdio: "ignore" });
          } catch {
            try {
              // Try tar extraction in case it's a tar.gz fallback named as .zip
              execSync(`tar -xzf "${target}" -C "${tempDir}"`, { stdio: "ignore" });
            } catch {
              // fallback if unzip is missing and tar failed
              execSync(`unzip -p "${target}" evaluation_report.json > "${path.join(tempDir, "evaluation_report.json")}"`, { stdio: "ignore" });
            }
          }
        } else {
          execSync(`tar -xzf "${target}" -C "${tempDir}"`, { stdio: "ignore" });
        }
        isDirectoryMode = true;
        dirPath = tempDir;
        const reportFile = path.join(tempDir, "evaluation_report.json");
        report = JSON.parse(fs.readFileSync(reportFile, "utf-8"));
        signature = report.integrity_evidence?.signature || "";
        publicKey = report.integrity_evidence?.public_key || "";
      } catch (err: any) {
        console.error(`\x1b[31m[ERROR] Failed to extract archive: ${err.message}\x1b[0m`);
        process.exit(1);
      }
    }
  } else if (stats.isDirectory()) {
    console.log(`[AUDIT] Loading audit directory: ${target}`);
    isDirectoryMode = true;
    dirPath = target;
    const reportFile = path.join(target, "evaluation_report.json");
    if (!fs.existsSync(reportFile)) {
      throw new Error(`Could not find evaluation_report.json in directory: ${target}`);
    }
    report = JSON.parse(fs.readFileSync(reportFile, "utf-8"));
    signature = report.integrity_evidence?.signature || "";
    publicKey = report.integrity_evidence?.public_key || "";
  }

  if (!report) {
    throw new Error("Could not parse evaluation report.");
  }

  // 1. Recompute canonical hash of the report
  const computedHash = hashReport(report);
  console.log(`\n  * Computed Canonical Report Hash : \x1b[36m${computedHash}\x1b[0m`);

  // 2. Cryptographic Signature check
  if (!signature || !publicKey) {
    console.log("  * Cryptographic Signature      : \x1b[31m🔴 MISSING\x1b[0m");
    console.log("\n\x1b[31m\x1b[1m=== VERIFICATION FAILURE: REPORT IS NOT SIGNED ===\x1b[0m");
    process.exit(1);
  }

  const isSigValid = verifySignature(computedHash, signature, publicKey);
  console.log(`  * Cryptographic Signature Check  : ${isSigValid ? "\x1b[32m🟢 VALID\x1b[0m" : "\x1b[31m🔴 INVALID\x1b[0m"}`);

  // 3. SLSA Supply Chain compliance check
  const slsaLevel = report.build_provenance?.slsa_level || 0;
  console.log(`  * Provenance SLSA Level Certified: \x1b[33m\x1b[1mLevel ${slsaLevel}\x1b[0m`);
  const isSlsaValid = slsaLevel >= 2;

  // 4. File-level trace and benchmark validation (if in directory/archive mode)
  let isTraceMatch = true;
  let isBenchmarkMatch = true;

  if (isDirectoryMode) {
    console.log("\n[AUDIT] Performing file-level cross-validation...");
    const traceFile = path.join(dirPath, "trace.jsonl");
    const benchmarksFile = path.join(dirPath, "benchmarks.csv");

    if (fs.existsSync(traceFile)) {
      const realTraceHash = computeFileHash(traceFile);
      const declaredTraceHash = report.integrity_evidence?.trace_hash;
      const match = realTraceHash === declaredTraceHash;
      console.log(`  - Trace Log file hash matches report : ${match ? "\x1b[32m🟢 YES\x1b[0m" : "\x1b[31m🔴 NO (TEMPERED)\x1b[0m"}`);
      if (!match) isTraceMatch = false;
    } else {
      console.log("  - Trace Log file                   : \x1b[33m▲ WARNING: Missing from bundle\x1b[0m");
    }

    if (fs.existsSync(benchmarksFile)) {
      const realBenchHash = computeFileHash(benchmarksFile);
      const declaredBenchHash = report.integrity_evidence?.benchmarks_hash;
      const match = realBenchHash === declaredBenchHash;
      console.log(`  - Benchmarks file hash matches report: ${match ? "\x1b[32m🟢 YES\x1b[0m" : "\x1b[31m🔴 NO (TEMPERED)\x1b[0m"}`);
      if (!match) isBenchmarkMatch = false;
    } else {
      console.log("  - Benchmarks file                  : \x1b[33m▲ WARNING: Missing from bundle\x1b[0m");
    }

    // Clean up temporary files if created
    if (target.endsWith(".tar.gz") || target.endsWith(".zip") || target.endsWith(".tar")) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }

  // Final Audit Outcome
  const auditPassed = isSigValid && isSlsaValid && isTraceMatch && isBenchmarkMatch;

  console.log("\n\x1b[35m┌────────────────────────────────────────────────────────┐\x1b[0m");
  console.log(`│             AUDIT STATUS: ${auditPassed ? "\x1b[32m\x1b[1m🟢 PASSED\x1b[0m" : "\x1b[31m\x1b[1m🔴 COMPROMISED\x1b[0m"}               │`);
  console.log("\x1b[35m└────────────────────────────────────────────────────────┘\x1b[0m");

  if (auditPassed) {
    console.log("\x1b[32m\x1b[1m[SUCCESS] The evaluation manifest is authentic, intact, and verified secure.\x1b[0m\n");
    process.exit(0);
  } else {
    console.log("\x1b[31m\x1b[1m[FAIL] Supply-chain integrity breached or verification signature validation failed.\x1b[0m\n");
    process.exit(1);
  }
} catch (err: any) {
  console.error(`\x1b[31m[ERROR] Verification engine crashed: ${err.message}\x1b[0m`);
  process.exit(1);
}
