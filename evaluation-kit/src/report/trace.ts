import { computeHash } from './hash';

export interface TraceRecord {
  cycle: number;
  pc: number;
  opcode: string;
  registers: number[];
  stateHash: string;
}

/**
 * Simulates a deterministic execution trace of the 32-register Virtual CPU.
 * Ensures consistent output hashes and cycles.
 */
export function generateDeterministicTraces(cycles: number = 100): TraceRecord[] {
  const records: TraceRecord[] = [];
  const registers = new Array(32).fill(0);
  let pc = 1000;

  for (let cycle = 1; cycle <= cycles; cycle++) {
    // Standard deterministic register modification (no system-time or floating point inputs)
    const reg = (cycle - 1) % 32;
    registers[reg] = (registers[reg] + (cycle * 7)) | 0; // standard 32-bit integer truncation
    
    // Virtual program counter increments by 4
    pc += 4;
    
    // Construct instruction name deterministically
    const opcode = `ALU_ADD R${reg}, ${cycle * 7}`;
    
    // Compute current cycle state hash (SHA-256)
    const registersStr = registers.join(',');
    const stateHash = computeHash(`${pc}:${opcode}:${registersStr}`);

    records.push({
      cycle,
      pc,
      opcode,
      registers: [...registers],
      stateHash
    });
  }

  return records;
}

/**
 * Converts trace records into a standard .jsonl (JSON Lines) string.
 */
export function serializeTraceToJsonl(records: TraceRecord[]): string {
  return records.map(record => JSON.stringify(record)).join('\n') + '\n';
}
