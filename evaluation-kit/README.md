# VEK Reference Implementation — Reproducible Evaluation Kit (REK)
## Version 3.3.0-RC1 (FIPS-Compliance Certified)

Welcome to the **Verifiable Execution Kernel (VEK) Evaluation Kit**. This self-contained directory provides third-party engineering teams, licensing evaluators, and security auditors with the exact tools, reproducible datasets, and verification procedures required to independently validate the core execution and consensus guarantees of the VEK platform.

---

## 📂 Evaluation Kit Structure

This package is structured to allow immediate, zero-dependency testing of all five reference implementation (RI) enclaves:

```text
evaluation-kit/
├── README.md               <-- This Master Evaluation Guide
├── traceability_matrix.md  <-- Maps claims, specifications, schemas, and code files
├── evidence_catalog.md     <-- Documented proofs, logs, and cryptographic output comparisons
└── verify_all.sh           <-- One-step automated validation and conformance check script
```

---

## 🚀 3-Minute Quickstart

Evaluators can reproduce the entire execution pipeline, consensus reconciliations, SCADA interlocks, signed log outputs, and patent mappings with a single command.

### Step 1: Install Dependencies
Ensure you have Node.js (v18+) installed. At the project root, run:
```bash
npm install
```

### Step 2: Execute the Automated Validation Matrix
Run the master evaluation script directly from your terminal:
```bash
npm run demo
```

### Step 3: Run the Local Development Server (Optional)
To interact with the visual diagnostic interface and review active trace graphs, boot the administration console:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 🧪 Detailed Simulation Scenarios & Expected Outputs

Auditors can compare terminal outputs directly with our documented expected behaviors below:

### 1. Hello World (Deterministic VM Stepping)
* **Objective**: Verifies instruction parsing and register isolation on the virtual CPU.
* **Output to Watch For**: A computed SHA-512 state root hash representing isolated memory arrays after instruction ticks.
* **Reproducible Test Vector**: `examples/reference_datasets/calculator.json`

### 2. Replay Demo (Consensus & Float-Drift Isolation)
* **Objective**: Simulates multi-enclave redundant execution where Node C (simulating Apple M3 silicon) drifts from Nodes A and B (Intel/AMD) at Cycle 4,822 due to floating-point representation variances.
* **Output to Watch For**:
  ```text
  [STATUS] 2/3 Consensus threshold MET. Validated state value: 42.1247205022
  [QUARANTINE] Node [Node_C_Apple_M3] has diverged from consensus! Triggering isolation.
  [Rollback] Resynchronizing [Node_C_Apple_M3]...
  [Replay-Service] Rollback completed in 0.22 ms. Node reinstated to active replication pool.
  ```
* **Reproducible Test Vector**: `examples/reference_datasets/replay_success.json`

### 3. Constraint Demo (SCADA Invariant Enforcement)
* **Objective**: Intercepts an unsafe Modbus command (simulating thermal runaway voltage injection) before it is stabilized.
* **Output to Watch For**: Rejection logs triggering an emergency safety lock and printing a signed interlock seal (SHA-512).
* **Reproducible Test Vector**: `examples/reference_datasets/constraint_violation.json`

### 4. Audit Bundle Demo (Verifiable WAL Persistence)
* **Objective**: Formats transaction logs to strict versioned schemas and attaches Ed25519 signatures.
* **Output to Watch For**: Complete JSON dump matching the `/schemas/audit_bundle_v1.json` format.
* **Reproducible Test Vector**: `examples/reference_datasets/audit_bundle.json`

### 5. Claim Graph Demo (Patent CIM Mappings)
* **Objective**: Queries the Claim-to-Implementation Matrix (CIM) to map active code statements to USPTO patent applications.
* **Output to Watch For**: Programmatic validation trace proving Claim 1 coverage and generating an assertion proof digest.

---

## 🎯 Conformance Verification

To confirm that your test results conform to official specifications, cross-reference your outputs with:
1. 🎓 **[`docs/CONFORMANCE_SPECIFICATION.md`](/docs/CONFORMANCE_SPECIFICATION.md)**: Defines compliance checks for Level 1, 2, and 3 runtimes.
2. 📋 **[`docs/EGVS.md`](/docs/EGVS.md)**: Details risk classification levels and governance lifecycle gates.
3. 📘 **[`docs/adr/`](/docs/adr/)**: Architectural rationale covering float-scaling, WAL persistence, and SCADA isolation.
