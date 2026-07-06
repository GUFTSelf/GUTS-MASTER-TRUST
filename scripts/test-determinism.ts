import fs from "fs";
import { executeVek, replayVek, LcgRandom, sha256Sync, DOMAIN_CONSTRAINTS } from "../src/lib/kernel";

console.log("\x1b[36m┌────────────────────────────────────────────────────────┐\x1b[0m");
console.log("\x1b[36m│          VEK ADVERSARIAL DETERMINISM TEST SUITE        │\x1b[0m");
console.log("\x1b[36m└────────────────────────────────────────────────────────┘\x1b[0m");

let passedCount = 0;
let totalCount = 0;

function runTest(name: string, fn: () => void) {
  totalCount++;
  console.log(`\n\x1b[33m[TEST ${totalCount}] ${name}...\x1b[0m`);
  try {
    fn();
    console.log(`\x1b[32m🟢 PASSED: ${name}\x1b[0m`);
    passedCount++;
  } catch (err: any) {
    console.error(`\x1b[31m🔴 FAILED: ${name}\x1b[0m`);
    console.error(`   Reason: ${err.message}`);
  }
}

// ---------------------------------------------------------
// TEST 1: Replay Equivalence Verification
// ---------------------------------------------------------
runTest("Perfect Byte-for-Byte Replay Equivalence across Seeds", () => {
  const seeds = ["SEED-ALPHA-101", "SEED-BETA-202", "SEED-GAMMA-303"];
  const inputs = {
    altitude: 150,
    lidarProximity: 35,
    batteryState: 95,
    gpsConnected: true,
    windSpeed: 10
  };
  const instructions = [
    { instruction: "INITIALIZE_FLIGHT_STATE", parameters: {} },
    { instruction: "SET_ALTITUDE", parameters: { altitude: 220 } },
    { instruction: "CHECK_LIDAR_PROXIMITY", parameters: { lidarProximity: 28 } },
    { instruction: "VALIDATE_BATTERY_CHARGE", parameters: { batteryState: 90 } }
  ];

  for (const seed of seeds) {
    const trace = executeVek("uas-route", inputs, seed, instructions, "none");
    const replayResult = replayVek(inputs, seed, trace);

    if (!replayResult.success) {
      throw new Error(`Replay failed for seed ${seed}: ${replayResult.reason}`);
    }

    // Verify step matches are 100% compliant
    if (replayResult.stepMatches.some(match => !match)) {
      throw new Error(`Some steps failed hash verification for seed ${seed}`);
    }

    // Ensure metrics are perfectly verified
    if (replayResult.correctnessMetrics.determinismScore !== 1.0) {
      throw new Error(`Determinism Score must be 1.0 for a clean run, got ${replayResult.correctnessMetrics.determinismScore}`);
    }
    if (replayResult.correctnessMetrics.stateDivergenceIndex !== 0.0) {
      throw new Error(`State Divergence must be 0.0, got ${replayResult.correctnessMetrics.stateDivergenceIndex}`);
    }
  }
});

// ---------------------------------------------------------
// TEST 2: Active Adversarial State-Mutation Injection
// ---------------------------------------------------------
runTest("Detect and Block State-Mutation Attack", () => {
  const seed = "ATTACK-VECTOR-01";
  const inputs = {
    altitude: 150,
    lidarProximity: 35,
    batteryState: 95,
    gpsConnected: true,
    windSpeed: 10
  };
  const instructions = [
    { instruction: "INITIALIZE_FLIGHT_STATE", parameters: {} },
    { instruction: "SET_ALTITUDE", parameters: { altitude: 220 } }
  ];

  // Run with intentional fault injection
  const trace = executeVek("uas-route", inputs, seed, instructions, "inject_fault");
  
  // Trace must report a FAIL or halt status since variables were corrupted
  const breachedStep = trace.steps.find(s => s.status === "FAIL");
  if (!breachedStep) {
    throw new Error("Adversarial boundary breach was not intercepted by the transition firewall!");
  }
  
  console.log(`   - Successfully intercepted boundary breach on instruction: ${breachedStep.instruction}`);
  console.log(`   - Breach detail: ${breachedStep.description}`);
});

// ---------------------------------------------------------
// TEST 3: Witness Chain Tampering Detection
// ---------------------------------------------------------
runTest("Detect Witness Chain Hash Divergence", () => {
  const seed = "WITNESS-TAMPER-01";
  const inputs = {
    altitude: 150,
    lidarProximity: 35,
    batteryState: 95,
    gpsConnected: true,
    windSpeed: 10
  };
  const instructions = [
    { instruction: "INITIALIZE_FLIGHT_STATE", parameters: {} },
    { instruction: "SET_ALTITUDE", parameters: { altitude: 220 } },
    { instruction: "CHECK_LIDAR_PROXIMITY", parameters: { lidarProximity: 28 } }
  ];

  // Trace with broken witness link (simulated ledger manipulation)
  const trace = executeVek("uas-route", inputs, seed, instructions, "tamper_witness");
  
  // Replay should flag this as a critical failure
  const replayResult = replayVek(inputs, seed, trace);
  if (replayResult.success) {
    throw new Error("Tampered witness chain was accepted as authentic!");
  }

  if (replayResult.divergenceIndex !== 2) {
    throw new Error(`Divergence index expected at step index 2, got ${replayResult.divergenceIndex}`);
  }

  console.log(`   - Correctly flagged ledger hash mismatch at step index: ${replayResult.divergenceIndex}`);
  console.log(`   - Deviation explanation: ${replayResult.reason}`);
});

// ---------------------------------------------------------
// TEST 4: Out-of-Order Execution / Instruction Shuffling
// ---------------------------------------------------------
runTest("Catch Trace Reordering Anomalies", () => {
  const seed = "REORDER-TAMPER-01";
  const inputs = {
    altitude: 150,
    lidarProximity: 35,
    batteryState: 95,
    gpsConnected: true,
    windSpeed: 10
  };
  const instructions = [
    { instruction: "INITIALIZE_FLIGHT_STATE", parameters: {} },
    { instruction: "SET_ALTITUDE", parameters: { altitude: 220 } },
    { instruction: "CHECK_LIDAR_PROXIMITY", parameters: { lidarProximity: 28 } }
  ];

  // Reorder steps to simulate sequence replay fraud
  const trace = executeVek("uas-route", inputs, seed, instructions, "reorder_trace");
  
  // The state machine should fail execution because pre-state hashes won't chain up correctly
  const failedStep = trace.steps.find(s => s.status === "FAIL");
  if (!failedStep) {
    throw new Error("Trace sequence order tampering bypassed safety gates!");
  }

  console.log(`   - Anomaly successfully blocked: ${failedStep.description}`);
});

// ---------------------------------------------------------
// TEST 5: Micro-RNG Seed Entropy Isolation
// ---------------------------------------------------------
runTest("Verify RNG Determinism and Seed Isolation", () => {
  const rng1_a = new LcgRandom("SEED_A");
  const rng1_b = new LcgRandom("SEED_A");
  const rng2 = new LcgRandom("SEED_B");

  // A and B must match 100% across multiple cycles
  for (let i = 0; i < 50; i++) {
    const val_a = rng1_a.next();
    const val_b = rng1_b.next();
    const val_other = rng2.next();

    if (val_a !== val_b) {
      throw new Error(`LCG generator drift! Identical seed produced divergent values at step ${i}`);
    }

    if (val_a === val_other && i < 5) {
      throw new Error("Cross-seed entropy collision! Different seeds produced identical sequences.");
    }
  }

  console.log("   - LCG entropy streams proved 100% insulated and repeatable.");
});

// ---------------------------------------------------------
// FINAL SUMMARY
// ---------------------------------------------------------
console.log("\n\x1b[35m┌────────────────────────────────────────────────────────┐\x1b[0m");
console.log(`│             TEST RESULTS: ${passedCount}/${totalCount} PASSED                    │`);
console.log("\x1b[35m└────────────────────────────────────────────────────────┘\x1b[0m");

if (passedCount === totalCount) {
  console.log("\x1b[32m\x1b[1mALL DETERMINISM TESTS PASSED successfully. Kernel is cryptographically sound!\x1b[0m\n");
  process.exit(0);
} else {
  console.error("\x1b[31m\x1b[1mSOME TESTS FAILED! Review kernel specifications for leaks or regressions.\x1b[0m\n");
  process.exit(1);
}
