import fs from "fs";
import path from "path";

export interface EpoSignature {
  algorithm: string;
  public_key: string;
  signature: string;
}

export interface ExecutionProofObject {
  epo_version: string;
  kernel_version: string;
  domain: string;
  execution_id: string;
  seed: string | number;
  initial_state_hash: string;
  final_state_hash: string;
  inputs: {
    step: number;
    command: string;
    payload_hash: string;
    payload: Record<string, any>;
  }[];
  trace: {
    step: number;
    prev_hash: string;
    state_hash: string;
    input_hash: string;
  }[];
  proof_hash: string;
  signature?: string | EpoSignature;
  publicKey?: string;
}

export function loadEPO(filePath: string): ExecutionProofObject {
  try {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`EPO file not found at path: ${filePath}`);
    }
    const raw = fs.readFileSync(absolutePath, "utf-8");
    const epo = JSON.parse(raw);
    return epo as ExecutionProofObject;
  } catch (err: any) {
    throw new Error(`Failed to load or parse EPO file: ${err.message}`);
  }
}
