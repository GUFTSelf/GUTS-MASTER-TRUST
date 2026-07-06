import { recomputeExecution } from "../../verifier/src/recompute";
import { canonicalJsonStringify, sha256Sync } from "../../verifier/src/hash";
import fs from "fs";
import path from "path";

export interface RunResult {
  suiteId: string;
  environment: string;
  initialStateHash: string;
  finalStateHash: string;
  traceHash: string;
  variables: Record<string, any>;
  timestamp: string;
}

export function runSuiteLocally(suite: any): RunResult {
  const recomputation = recomputeExecution(suite.domain, suite.seed, suite.inputs);
  
  // Compute trace hash
  const traceHash = sha256Sync(canonicalJsonStringify(recomputation.trace));

  return {
    suiteId: suite.id,
    environment: "local-node-current",
    initialStateHash: recomputation.initialStateHash,
    finalStateHash: recomputation.finalStateHash,
    traceHash,
    variables: recomputation.variables,
    timestamp: new Date().toISOString()
  };
}
