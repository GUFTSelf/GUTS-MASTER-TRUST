/**
 * VEK Technology Evaluation Suite
 * Example: constraint_demo/demo.js
 * 
 * Demonstrates:
 * 1. Defining SCADA/PLC safety policies (e.g. max cell voltage <= 4200).
 * 2. Simulating a standard Modbus write operation command.
 * 3. Real-time cycle-level intercept validation.
 * 4. Preventing thermal runaway or invalid register state transition by halting execution.
 */

import crypto from 'crypto';

class ExecutionGatedAssertionEngine {
  constructor() {
    this.safetyPolicies = {
      INVARIANT_01: {
        description: "Hard cap on battery cell voltage (4.20V max to prevent thermal runaway)",
        check: (registers) => registers[40015] <= 4200
      },
      INVARIANT_02: {
        description: "Minimum cell operating temperature (20C min)",
        check: (registers) => registers[40016] >= 20
      },
      INVARIANT_03: {
        description: "Maximum cell operating temperature (60C max)",
        check: (registers) => registers[40016] <= 60
      }
    };
    
    // Initial safe state values
    this.registers = {
      40010: 1,    // Status: Online
      40015: 4100,  // Cell Voltage: 4.10V
      40016: 25     // Temperature: 25C
    };
  }

  evaluateModbusWrite(address, value) {
    console.log(`\n[SCADA] Received Modbus Write Command -> Address: ${address}, Value: ${value}`);
    
    // Create candidate state to verify
    const candidateRegisters = { ...this.registers, [address]: value };
    
    let allInvariantsPassed = true;
    let failedInvariantId = null;

    for (const [policyId, policy] of Object.entries(this.safetyPolicies)) {
      const isPassed = policy.check(candidateRegisters);
      if (!isPassed) {
        allInvariantsPassed = false;
        failedInvariantId = policyId;
        break;
      }
    }

    if (allInvariantsPassed) {
      this.registers = candidateRegisters;
      console.log(`[EGAF] INVARIANT EVALUATION PASSED. Command written to Modbus Register Space.`);
      console.log(`[EGAF] Active register map:`, this.registers);
    } else {
      console.log(`[EGAF] !!! INVARIANT VIOLATION DETECTED !!!`);
      console.log(`  * Policy Violated: ${failedInvariantId}`);
      console.log(`  * Description: ${this.safetyPolicies[failedInvariantId].description}`);
      console.log(`  * Candidate Value: ${value} violates defined safety threshold.`);
      this.triggerEmergencyInterlock(address, value);
    }
  }

  triggerEmergencyInterlock(failedAddress, blockedValue) {
    console.log("[INTERLOCK] BLOCKING Modbus command write.");
    console.log("[INTERLOCK] Freezing physical PLC clock cycles...");
    
    const timestamp = new Date().toISOString();
    const signaturePayload = `${timestamp}:${failedAddress}:${blockedValue}`;
    const auditSeal = crypto.createHash('sha512').update(signaturePayload).digest('hex');
    
    console.log(`[INTERLOCK] GENERATED EMERGENCY AUDIT SEAL (SHA-512):\n  ${auditSeal.substring(0, 64)}...`);
    console.log("[STATUS] Enclave locked. Systems isolated from grid control.");
  }
}

function runDemo() {
  console.log("=== VEK EGAF INDUSTRIAL SCADA INTERLOCK SIMULATION ===");
  const engine = new ExecutionGatedAssertionEngine();

  // 1. Send safe write command (increasing voltage to 4.15V)
  engine.evaluateModbusWrite(40015, 4150);

  // 2. Send unsafe write command (increasing voltage to 4.50V - dangerous thermal risk!)
  engine.evaluateModbusWrite(40015, 4500);
}

runDemo();
