import { loadEPO, ExecutionProofObject } from "./loadEPO";
import { recomputeExecution } from "./recompute";
import { canonicalJsonStringify, sha512Sync } from "./hash";
import { verifySeal } from "./sealCheck";

export interface VerificationResult {
  status: "VALID" | "INVALID";
  schemaMatch: boolean;
  traceRootMatch: boolean;
  outputMatch: boolean;
  sealValid: boolean;
  recomputedFinalStateHash: string;
  expectedFinalStateHash: string;
  recomputedProofHash: string;
  expectedProofHash: string;
  details?: string;
}

export function verifyEPOFile(epoPath: string): VerificationResult {
  try {
    // 1. Load the Execution Proof Object
    const epo = loadEPO(epoPath);

    // 2. Schema check - Must be v2.1 or v1
    const isSchemaValid = epo.epo_version === "2.1" || epo.epo_version === "1.0";
    if (!isSchemaValid) {
      return {
        status: "INVALID",
        schemaMatch: false,
        traceRootMatch: false,
        outputMatch: false,
        sealValid: false,
        recomputedFinalStateHash: "",
        expectedFinalStateHash: epo.final_state_hash || "",
        recomputedProofHash: "",
        expectedProofHash: epo.proof_hash || "",
        details: `Unsupported schema version: ${epo.epo_version}`
      };
    }

    // 3. Re-execute state transition logs deterministically from inputs and seed
    const domain = epo.domain;
    const seed = epo.seed;
    const inputs = epo.inputs.map(input => ({
      step: input.step,
      command: input.command,
      payload: input.payload
    }));

    const recomputation = recomputeExecution(domain, seed, inputs);

    // 4. Compute canonical proof hash from the recomputed state copy
    const epoCopy = {
      epo_version: epo.epo_version,
      kernel_version: epo.kernel_version,
      domain: epo.domain,
      execution_id: epo.execution_id,
      seed: epo.seed,
      initial_state_hash: epo.initial_state_hash,
      final_state_hash: recomputation.finalStateHash, // Bind to our recomputed final state
      inputs: epo.inputs,
      trace: recomputation.trace // Bind to our recomputed trace
    };

    const recomputedProofHash = sha512Sync(canonicalJsonStringify(epoCopy));

    // 5. Check if recomputed final state matches expectation
    const outputMatch = recomputation.finalStateHash === epo.final_state_hash;

    // 6. Check if recomputed trace proof hash matches stored
    const traceRootMatch = recomputedProofHash === epo.proof_hash;

    // 7. Verify cryptographic signature seal
    const sealValid = verifySeal(epo);

    const valid = outputMatch && traceRootMatch && sealValid;

    return {
      status: valid ? "VALID" : "INVALID",
      schemaMatch: true,
      traceRootMatch,
      outputMatch,
      sealValid,
      recomputedFinalStateHash: recomputation.finalStateHash,
      expectedFinalStateHash: epo.final_state_hash,
      recomputedProofHash,
      expectedProofHash: epo.proof_hash,
      details: valid 
        ? "Absolute bit-for-bit determinism and cryptographic sealing verified successfully." 
        : `Verification failures detected:${!outputMatch ? " [Final state mismatch]" : ""}${!traceRootMatch ? " [Trace hash mismatch]" : ""}${!sealValid ? " [Invalid signature seal]" : ""}`
    };
  } catch (err: any) {
    return {
      status: "INVALID",
      schemaMatch: false,
      traceRootMatch: false,
      outputMatch: false,
      sealValid: false,
      recomputedFinalStateHash: "",
      expectedFinalStateHash: "",
      recomputedProofHash: "",
      expectedProofHash: "",
      details: `Verification system crashed: ${err.message}`
    };
  }
}
