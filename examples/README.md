# VEK Reference Implementation (RI) Evaluation Suite

This folder contains the complete, executable **Reference Implementation** demonstrating the core execution, validation, and claim-traceability mechanics of the Verifiable Execution Kernel (VEK).

---

## 🚀 Quick Start

To execute the entire reference implementation matrix and generate a certified verification report inside your terminal, run:

```bash
npm run demo
```

This single command triggers the sequential execution of five dedicated testing modules, each validating a core capability of the VEK platform under real programmatic conditions.

---

## 📋 Evaluation Modules

### 1. Hello World (`/examples/hello_world/`)
* **Objective**: Verifies the cycle-accurate instruction stepping and state registration on the 32-register virtual CPU.
* **Verification Proof**: Produces a terminal State Root Hash (SHA-512) representing the complete memory footprint after loading program bytes.

### 2. Replay Demo (`/examples/replay_demo/`)
* **Objective**: Simulates multi-node redundant execution across heterogeneous enclaves and triggers an intentional drift at Cycle 4,822.
* **Verification Proof**: Demonstrates the Consensus Reconciler instantly isolating Node C and executing a 2/3 majority rollback within 0.25 ms.

### 3. Constraint Demo (`/examples/constraint_demo/`)
* **Objective**: Evaluates inline safety policies on industrial SCADA Modbus controls in real-time.
* **Verification Proof**: Intercepts an unsafe write operation (thermal runaway hazard) and outputs a signed emergency interlock audit seal while locking the sandbox.

### 4. Audit Bundle Demo (`/examples/audit_bundle_demo/`)
* **Objective**: Records active traces and structures verification data exactly to the versioned `/schemas/audit_bundle_v1.json` schema.
* **Verification Proof**: Compiles a fully compliant, cryptographically chained, and Ed25519-signed Write-Ahead Log (WAL) audit bundle.

### 5. Claim Graph Demo (`/examples/claim_graph_demo/`)
* **Objective**: Queries the Claim-to-Implementation Matrix (CIM) to trace a specific USPTO patent claim to physical source modules.
* **Verification Proof**: Triggers the simulated verification suite 'test_register_level_isolation' and generates an assertion proof digest.

---

## 🧬 Interoperability and Schemas

To maintain clean cross-language and platform compatibility, all deliverables conform strictly to our production-ready JSON schemas located in the root `/schemas/` directory:

1. 📂 **`audit_bundle_v1.json`**: For structuring and verification of signed transaction ledger files.
2. 📂 **`claim_graph_v1.json`**: For tracing compliance evidence back to USPTO patent claims.
3. 📂 **`execution_proof_v1.json`**: For validating cycle-by-cycle algebraic witness commitments.
4. 📂 **`protocol_v1.json`**: For securing real-time inter-service consensus voter packets and Modbus interceptions.

---

## 💾 Reference Datasets & Test Vectors

Reviewers can verify standard payloads and expected hash behaviors using our JSON test vectors:
- 📂 **[`examples/reference_datasets/calculator.json`](/examples/reference_datasets/calculator.json)**: Verifies scaled fixed-point mathematical inputs.
- 📂 **[`examples/reference_datasets/constraint_violation.json`](/examples/reference_datasets/constraint_violation.json)**: Payloads for testing safety-critical SCADA triggers.
- 📂 **[`examples/reference_datasets/replay_success.json`](/examples/reference_datasets/replay_success.json)**: Consensus alignment and multi-node voter payloads.
- 📂 **[`examples/reference_datasets/audit_bundle.json`](/examples/reference_datasets/audit_bundle.json)**: Valid, schema-compliant log payloads.

---

## 🏛️ Architecture Decision Records (ADRs)

Our core design rationale is captured in high-fidelity architectural specifications:
- 📘 **[`docs/adr/0001-deterministic-runtime.md`](/docs/adr/0001-deterministic-runtime.md)**: Scaling floating-point states to prevent consensus divergence.
- 📘 **[`docs/adr/0002-claim-graph-traceability.md`](/docs/adr/0002-claim-graph-traceability.md)**: Tracing programmatic execution to USPTO patent claims.
- 📘 **[`docs/adr/0003-audit-bundle-wal.md`](/docs/adr/0003-audit-bundle-wal.md)**: Light-weight, signature-signed write-ahead transaction ledgers.
- 📘 **[`docs/adr/0004-egaf-separation.md`](/docs/adr/0004-egaf-separation.md)**: Isolating candidate computations from physical register commitment.

---

## 🎓 Conformance Specification

What makes an implementation officially VEK-compliant? See our multi-tiered engineering guide:
- 🗺️ **[`docs/CONFORMANCE_SPECIFICATION.md`](/docs/CONFORMANCE_SPECIFICATION.md)**: Specifies Level 1, 2, and 3 conformance checkpoints for reviewers.

