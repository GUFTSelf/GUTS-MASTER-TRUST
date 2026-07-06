import { executeStep, LcgRandom, VekState } from "../../src/lib/kernel";
import { canonicalJsonStringify, sha256Sync } from "./hash";

export interface RecomputedStep {
  step: number;
  command: string;
  pre_hash: string;
  state_hash: string;
  input_hash: string;
  payload: Record<string, any>;
}

export interface RecomputationResult {
  initialStateHash: string;
  finalStateHash: string;
  trace: {
    step: number;
    prev_hash: string;
    state_hash: string;
    input_hash: string;
  }[];
  steps: RecomputedStep[];
  variables: Record<string, any>;
}

export function recomputeExecution(
  domain: string,
  seed: string | number,
  inputs: { step: number; command: string; payload: Record<string, any> }[]
): RecomputationResult {
  const rng = new LcgRandom(String(seed));
  let currentState: VekState = {
    domain,
    variables: {},
    status: "INIT",
    lastInstruction: "START"
  };

  const steps: RecomputedStep[] = [];
  const trace: { step: number; prev_hash: string; state_hash: string; input_hash: string }[] = [];
  
  // Base initial hash for the domain
  let lastHash = sha256Sync(domain + String(seed));
  const initialStateHash = lastHash;

  for (let i = 0; i < inputs.length; i++) {
    const inputItem = inputs[i];
    const preHash = lastHash;

    const payloadHash = sha256Sync(canonicalJsonStringify(inputItem.payload));

    const { nextState } = executeStep(
      currentState,
      inputItem.command,
      inputItem.payload,
      rng
    );

    const varsCanonical = canonicalJsonStringify(nextState.variables);
    const postHash = sha256Sync(preHash + inputItem.command + varsCanonical);

    steps.push({
      step: inputItem.step,
      command: inputItem.command,
      pre_hash: preHash,
      state_hash: postHash,
      input_hash: payloadHash,
      payload: inputItem.payload
    });

    trace.push({
      step: inputItem.step,
      prev_hash: preHash,
      state_hash: postHash,
      input_hash: payloadHash
    });

    currentState = nextState;
    lastHash = postHash;
  }

  return {
    initialStateHash,
    finalStateHash: lastHash,
    trace,
    steps,
    variables: currentState.variables
  };
}
