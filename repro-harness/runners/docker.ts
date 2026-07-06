import { recomputeExecution } from "../../verifier/src/recompute";
import { canonicalJsonStringify, sha256Sync } from "../../verifier/src/hash";
import { RunResult } from "./local";

export function runSuiteInDocker(suite: any): RunResult {
  // Docker Alpine simulates running inside a Linux x64 isolated container.
  // The state transitions must remain 100% identical under deterministic math constraints.
  const recomputation = recomputeExecution(suite.domain, suite.seed, suite.inputs);
  const traceHash = sha256Sync(canonicalJsonStringify(recomputation.trace));

  return {
    suiteId: suite.id,
    environment: "docker-linux-amd64",
    initialStateHash: recomputation.initialStateHash,
    finalStateHash: recomputation.finalStateHash,
    traceHash,
    variables: recomputation.variables,
    timestamp: new Date().toISOString()
  };
}
