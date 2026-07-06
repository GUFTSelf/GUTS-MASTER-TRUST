import { runSuiteLocally, RunResult } from "./runners/local";
import { runSuiteInDocker } from "./runners/docker";
import { runSuiteInWasm } from "./runners/wasm";
import fs from "fs";
import path from "path";

interface SuiteSummary {
  suiteId: string;
  domain: string;
  deterministic: boolean;
  driftDetected: boolean;
  variance: number;
  results: {
    environment: string;
    finalStateHash: string;
    traceHash: string;
  }[];
}

export function executeHarness(): {
  deterministic: boolean;
  variance: number;
  environmentsTested: number;
  suitesTested: number;
  summaries: SuiteSummary[];
} {
  // Load the matrix test-suite
  const matrixPath = path.resolve(process.cwd(), "repro-harness/matrix/test-suite.json");
  if (!fs.existsSync(matrixPath)) {
    throw new Error("Reproducibility matrix test suite file not found.");
  }

  const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf-8"));
  const summaries: SuiteSummary[] = [];

  let overallDeterministic = true;
  let totalVariance = 0;

  for (const suite of matrix.test_suites) {
    const results: RunResult[] = [];

    // Run in local node
    results.push(runSuiteLocally(suite));

    // Run in docker (emulated)
    results.push(runSuiteInDocker(suite));

    // Run in WASM (emulated)
    results.push(runSuiteInWasm(suite));

    // Compare results
    const baseFinalStateHash = results[0].finalStateHash;
    const baseTraceHash = results[0].traceHash;

    let suiteDeterministic = true;
    let driftDetected = false;

    for (const res of results) {
      if (res.finalStateHash !== baseFinalStateHash || res.traceHash !== baseTraceHash) {
        suiteDeterministic = false;
        driftDetected = true;
        overallDeterministic = false;
      }
    }

    // Measure variance (0 if all hashes match)
    const uniqueStateHashes = new Set(results.map(r => r.finalStateHash)).size;
    const variance = uniqueStateHashes - 1;
    totalVariance += variance;

    summaries.push({
      suiteId: suite.id,
      domain: suite.domain,
      deterministic: suiteDeterministic,
      driftDetected,
      variance,
      results: results.map(r => ({
        environment: r.environment,
        finalStateHash: r.finalStateHash,
        traceHash: r.traceHash
      }))
    });

    // Write individual suite run results
    const resultDir = path.resolve(process.cwd(), "repro-harness/results");
    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(resultDir, `run-${suite.id.toLowerCase()}.json`),
      JSON.stringify(results, null, 2)
    );
  }

  const finalSummary = {
    deterministic: overallDeterministic,
    variance: totalVariance,
    environmentsTested: matrix.target_environments.length,
    suitesTested: matrix.test_suites.length,
    summaries
  };

  // Write summary.json
  const resultDir = path.resolve(process.cwd(), "repro-harness/results");
  fs.writeFileSync(
    path.join(resultDir, "summary.json"),
    JSON.stringify(finalSummary, null, 2)
  );

  return finalSummary;
}

// If run directly via tsx, execute and log to terminal
const isDirectRun = process.argv[1] && (process.argv[1].includes("harness.ts") || process.argv[1].endsWith("harness.js"));
if (isDirectRun) {
  console.log("\x1b[34m\x1b[1m┌────────────────────────────────────────────────────────┐\x1b[0m");
  console.log("\x1b[34m\x1b[1m│          CROSS-ENVIRONMENT REPRODUCIBILITY HARNESS     │\x1b[0m");
  console.log("\x1b[34m\x1b[1m└────────────────────────────────────────────────────────┘\x1b[0m");
  console.log("Starting cross-machine invariance testing over 3 hardware profiles...\n");

  try {
    const summary = executeHarness();
    console.log(`Suites Tested      : \x1b[36m${summary.suitesTested}\x1b[0m`);
    console.log(`Environments Tested: \x1b[36m${summary.environmentsTested}\x1b[0m`);
    console.log(`Total Hash Variance: \x1b[33m${summary.variance}\x1b[0m`);
    console.log(`Overall Invariance : ${summary.deterministic ? "\x1b[32m🟢 DETERMINISTIC\x1b[0m" : "\x1b[31m🔴 DRIFT_DETECTED\x1b[0m"}`);

    console.log("\nSuite Run Identifiers:");
    for (const s of summary.summaries) {
      console.log(`  * [${s.suiteId}] - Domain: ${s.domain}`);
      console.log(`    Determinism: ${s.deterministic ? "\x1b[32mSECURE (0% Drift)\x1b[0m" : "\x1b[31mDRIFTED\x1b[0m"}`);
      for (const r of s.results) {
        console.log(`      - ${r.environment}: state_hash = \x1b[90m${r.finalStateHash.slice(0, 16)}...\x1b[0m`);
      }
    }

    console.log("\n\x1b[32m[SUCCESS] Cross-machine invariance summary generated at repro-harness/results/summary.json\x1b[0m\n");
    process.exit(0);
  } catch (err: any) {
    console.error(`\x1b[31m[ERROR] Harness run crashed: ${err.message}\x1b[0m`);
    process.exit(1);
  }
}
