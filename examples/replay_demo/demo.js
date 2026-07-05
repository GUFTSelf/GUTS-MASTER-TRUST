/**
 * VEK Technology Evaluation Suite
 * Example: replay_demo/demo.js
 * 
 * Demonstrates:
 * 1. Heterogeneous multi-node execution (Nodes A, B, and C).
 * 2. Simulating a transcendental calculation cycle.
 * 3. Simulating an intentional IEEE 754 precision drift at Cycle 4,822 on Node C.
 * 4. Triggering the consensus reconciler to isolate the drifting node and trigger a rollback.
 */

class ConsensusReconciler {
  constructor() {
    this.nodes = {
      'Node_A_Intel_Xeon': { registers: { F3: 42.1234567890 }, status: 'ACTIVE' },
      'Node_B_AMD_EPYC':   { registers: { F3: 42.1234567890 }, status: 'ACTIVE' },
      'Node_C_Apple_M3':   { registers: { F3: 42.1234567890 }, status: 'ACTIVE' }
    };
    this.currentCycle = 4820;
  }

  simulateContinuousCalculations() {
    console.log(`[Consensus] Commencing loop execution starting at cycle ${this.currentCycle}...`);
    
    // Simulate execution up to cycle 4822
    for (let cycle = 4820; cycle <= 4822; cycle++) {
      this.currentCycle = cycle;
      
      if (cycle === 4822) {
        // Interject intentional IEEE 754 float precision deviation on Node C
        this.nodes['Node_C_Apple_M3'].registers.F3 += 0.0000100000;
        console.log(`[Cycle ${cycle}] Mathematical operation finished. Value cast recorded.`);
      } else {
        // Synchronized cycles
        this.nodes['Node_A_Intel_Xeon'].registers.F3 *= 1.000015;
        this.nodes['Node_B_AMD_EPYC'].registers.F3 *= 1.000015;
        this.nodes['Node_C_Apple_M3'].registers.F3 *= 1.000015;
      }
    }
  }

  evaluateConsensus() {
    console.log("\n[Consensus] Triggering cycle consensus audit...");
    const votes = {};
    
    // Group nodes by register F3 values
    for (const [nodeId, node] of Object.entries(this.nodes)) {
      const val = node.registers.F3.toFixed(10);
      if (!votes[val]) {
        votes[val] = [];
      }
      votes[val].push(nodeId);
    }

    console.log("[Consensus] Voting Register [F3] distribution:");
    for (const [val, nodeList] of Object.entries(votes)) {
      console.log(`  * Register Value: ${val} -> Agreed Nodes: [${nodeList.join(', ')}]`);
    }

    // Find majority state hash
    let consensusVal = null;
    let majorityList = [];
    for (const [val, nodeList] of Object.entries(votes)) {
      if (nodeList.length > majorityList.length) {
        consensusVal = val;
        majorityList = nodeList;
      }
    }

    const totalNodes = Object.keys(this.nodes).length;
    const approvalRatio = majorityList.length / totalNodes;

    console.log(`\n[Consensus] Majority agreement: ${(approvalRatio * 100).toFixed(2)}% (${majorityList.length}/${totalNodes} nodes)`);

    if (approvalRatio >= 0.666) {
      console.log(`[STATUS] 2/3 Consensus threshold MET. Validated state value: ${consensusVal}`);
      
      // Isolate drifted nodes
      for (const nodeId of Object.keys(this.nodes)) {
        if (!majorityList.includes(nodeId)) {
          console.log(`[QUARANTINE] Node [${nodeId}] has diverged from consensus! Triggering isolation.`);
          this.nodes[nodeId].status = 'ISOLATED';
          this.executeRollback(nodeId);
        }
      }
    } else {
      console.log("[CRITICAL] Consensus failure. Less than 2/3 agreement. Emergency system shutdown initialized.");
    }
  }

  executeRollback(nodeId) {
    console.log(`[Rollback] Resynchronizing [${nodeId}]...`);
    const startTime = Date.now();
    
    // Simulating rollback to Cycle 4,820 values
    this.nodes[nodeId].registers.F3 = this.nodes['Node_A_Intel_Xeon'].registers.F3;
    this.nodes[nodeId].status = 'ACTIVE_RECONCILED';
    
    const durationMs = 0.22; // Simulated microseconds-to-ms transition
    console.log(`[Replay-Service] Rollback completed in ${durationMs} ms. Node reinstated to active replication pool.`);
  }
}

function runDemo() {
  console.log("=== VEK CONSENSUS & FLOAT-DRIFT RECONCILER SIMULATION ===");
  const reconciler = new ConsensusReconciler();
  reconciler.simulateContinuousCalculations();
  reconciler.evaluateConsensus();
}

runDemo();
