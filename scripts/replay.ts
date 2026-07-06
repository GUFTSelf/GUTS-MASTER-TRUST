import fs from "fs";
import { replayVek } from "../src/lib/kernel";

console.log("\x1b[35m┌────────────────────────────────────────────────────────┐\x1b[0m");
console.log("\x1b[35m│               VEK DETERMINISTIC REPLAY ENGINE          │\x1b[0m");
console.log("\x1b[35m└────────────────────────────────────────────────────────┘\x1b[0m");

const tracePath = process.argv[2] || "trace.json";

try {
  if (!fs.existsSync(tracePath)) {
    console.error(`\x1b[31m[ERROR] Trace file not found: ${tracePath}\x1b[0m`);
    console.error("Please run execution first: \x1b[32mnpm run execute -- sample-input.json\x1b[0m");
    process.exit(1);
  }

  const rawTrace = fs.readFileSync(tracePath, "utf-8");
  const trace = JSON.parse(rawTrace);

  if (!trace.domain || !trace.inputs || !trace.seed || !trace.steps) {
    console.error("\x1b[31m[ERROR] File is not a valid VEK Execution Trace.\x1b[0m");
    process.exit(1);
  }

  console.log(`[REPLAY] Loading trace file: \x1b[1m${tracePath}\x1b[0m`);
  console.log(`[REPLAY] Re-executing domain: \x1b[35m${trace.domain.toUpperCase()}\x1b[0m`);
  console.log(`[REPLAY] Applying exact seed lock: \x1b[36m${trace.seed}\x1b[0m\n`);

  // Run the hardened verification replay
  const result = replayVek(trace.inputs, trace.seed, trace);

  console.log("\x1b[1mReplaying state transitions step-by-step:\x1b[0m");
  for (let i = 0; i < result.replayedSteps.length; i++) {
    const orig = trace.steps[i];
    const repl = result.replayedSteps[i];
    const isMatched = result.stepMatches[i];

    const matchStatus = isMatched ? "🟢 MATCH" : "🔴 DIVERGED";
    console.log(`  * [${orig.id}] \x1b[1m${orig.instruction.padEnd(26)}\x1b[0m -> ${matchStatus}`);
    console.log(`    - Original Post-State Hash : \x1b[90m${orig.postStateHash}\x1b[0m`);
    console.log(`    - Replayed Post-State Hash : \x1b[36m${repl.postStateHash}\x1b[0m`);
    if (!isMatched) {
      console.log(`    - \x1b[31m[DIVERGENCE DETAIL] ${repl.description}\x1b[0m`);
    }
  }

  console.log("\n\x1b[33m[REPLAY METRICS] Verification Replay Summary:\x1b[0m");
  console.log(`  - Determinism Score      : \x1b[1m${(result.correctnessMetrics.determinismScore * 100).toFixed(1)}%\x1b[0m`);
  console.log(`  - Replay Fidelity        : \x1b[1m${(result.correctnessMetrics.replayFidelity * 100).toFixed(1)}%\x1b[0m`);
  console.log(`  - Constraint Violation   : \x1b[1m${(result.correctnessMetrics.constraintViolationRate * 100).toFixed(1)}%\x1b[0m`);
  console.log(`  - State Divergence Index : \x1b[1m${(result.correctnessMetrics.stateDivergenceIndex * 100).toFixed(1)}%\x1b[0m`);

  if (result.success) {
    console.log("\n\x1b[32m\x1b[1m┌────────────────────────────────────────────────────────┐\x1b[0m");
    console.log("\x1b[32m\x1b[1m│      🟢 REPLAY VERIFICATION: SUCCESS (100% IDENTICAL)  │\x1b[0m");
    console.log("\x1b[32m\x1b[1m└────────────────────────────────────────────────────────┘\x1b[0m");
    console.log(`\x1b[32m[SUCCESS] Replay confirmed absolute byte-for-byte determinism. No drift or tampering detected.\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log("\n\x1b[31m\x1b[1m┌────────────────────────────────────────────────────────┐\x1b[0m");
    console.log("\x1b[31m\x1b[1m│      🔴 REPLAY VERIFICATION: COMPROMISED (DIVERGENCE)  │\x1b[0m");
    console.log("\x1b[31m\x1b[1m└────────────────────────────────────────────────────────┘\x1b[0m");
    console.log(`\x1b[31m[DIVERGENCE AT STEP ${result.divergenceIndex + 1}] ${result.reason}\x1b[0m\n`);
    process.exit(1);
  }

} catch (err: any) {
  console.error(`\x1b[31m[CRASH] Replay verification engine failure: ${err.message}\x1b[0m`);
  process.exit(1);
}
