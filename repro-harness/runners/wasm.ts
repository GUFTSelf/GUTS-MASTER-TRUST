import { recomputeExecution } from "../../verifier/src/recompute";
import { canonicalJsonStringify, sha256Sync } from "../../verifier/src/hash";
import { RunResult } from "./local";

export function runSuiteInWasm(suite: any): RunResult {
  // WebAssembly runner simulates running in a browser or V8 WASM sandbox.
  // Floating-point math and transitions must be bit-by-bit identical.
  const recomputation = recomputeExecution(suite.domain, suite.seed, suite.inputs);
  const traceHash = sha256Sync(canonicalJsonStringify(recomputation.trace));

  return {
    suiteId: suite.id,
    environment: "wasm-v8-emulated",
    initialStateHash: recomputation.initialStateHash,
    finalStateHash: recomputation.finalStateHash,
    traceHash,
    variables: recomputation.variables,
    timestamp: new Date().toISOString()
  };
}
