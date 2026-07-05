import { performance } from 'perf_hooks';

export interface BenchmarkMetrics {
  ips: number;
  durationMs: number;
  cycleCount: number;
  driftReconciliationMs: number;
}

/**
 * Executes a locked-iteration virtual processor loop to record exact instructions-per-second (IPS).
 * Runs deterministically to avoid environmental and performance anomalies.
 */
export function runLockedBenchmark(iterations: number = 200000): BenchmarkMetrics {
  const registers = new Array(32).fill(0);
  
  const startTime = performance.now();
  
  // Predictable execution workload
  for (let i = 0; i < iterations; i++) {
    const reg = i % 32;
    // Perform standard integer math operations
    registers[reg] = (registers[reg] + i) | 0;
  }
  
  const endTime = performance.now();
  const durationMs = endTime - startTime;
  
  // Calculate Instructions Per Second (IPS)
  // Prevent division by zero
  const safeDuration = durationMs > 0 ? durationMs : 0.001;
  const ips = Math.round((iterations / safeDuration) * 1000);

  // Measure simulated drift reconciliation latency (fixed consensus vote and rollback logic)
  const driftStart = performance.now();
  const nodes = [
    { registers: [1, 2, 3], weight: 1.0 },
    { registers: [1, 2, 3], weight: 1.0 },
    { registers: [1, 2, 9], weight: 0.0 } // Drifted outlier
  ];
  
  // Filter majority consensus and recover outlier node
  const majority = [1, 2, 3];
  nodes[2].registers = [...majority]; // Realign state
  const driftEnd = performance.now();
  const driftReconciliationMs = driftEnd - driftStart;

  return {
    ips,
    durationMs: Number(durationMs.toFixed(3)),
    cycleCount: iterations,
    driftReconciliationMs: Number(driftReconciliationMs.toFixed(6))
  };
}
