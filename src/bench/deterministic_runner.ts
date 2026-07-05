export class DeterministicRunner {
  private seed: number;

  constructor(seed = 1337) {
    this.seed = seed;
  }

  private rand() {
    // deterministic PRNG (LCG)
    this.seed = (1664525 * this.seed + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  async run(fn: () => void, iterations: number) {
    const samples: number[] = [];

    const isNode = typeof process !== 'undefined' && process.hrtime && typeof process.hrtime.bigint === 'function';

    for (let i = 0; i < iterations; i++) {
      let start: bigint | number;
      if (isNode) {
        start = process.hrtime.bigint();
      } else {
        start = typeof performance !== 'undefined' ? performance.now() : Date.now();
      }

      fn();

      if (isNode) {
        const end = process.hrtime.bigint();
        samples.push(Number((end as bigint) - (start as bigint)) / 1e6);
      } else {
        const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
        samples.push((end as number) - (start as number));
      }
    }

    return this.summarize(samples);
  }

  summarize(samples: number[]) {
    const sorted = [...samples].sort((a, b) => a - b);

    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

    return {
      mean_ms: mean,
      p95_ms: p95,
      p99_ms: p99,
      raw_hash_seed: this.seed
    };
  }
}
