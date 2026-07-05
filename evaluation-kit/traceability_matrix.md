# VEK Technical Traceability Matrix (TTM)
## Phase 1 Deliverable — High-Assurance Mapping

This matrix serves as the definitive legal and technical reference for evaluating the Verifiable Execution Kernel. It programmatically links **USPTO patent claims**, **mathematical operators**, **active JSON schemas**, and **executable reference code files** so reviewers can easily trace abstract specifications to verified implementations.

---

## 🗺️ Master Traceability Mappings

| USPTO Patent Claim ID | Mathematical Operator | Target Subsystem Domain | Active Schema Mapping | Reference Code Implementation | Verification / Regression Test |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Claim 1 (Core System)** | $G = \Sigma \circ \Psi \circ N \circ \Omega \circ P \circ F$ | End-to-end VM State Transition Pipeline | `schemas/protocol_v1.json` | `examples/run_all.js` | `npm run demo` |
| **Claim 2 (Core Method)** | $G(S_0, I, L)$ | Complete execution workflow sequence | `schemas/protocol_v1.json` | `examples/run_all.js` | Master sequence logs |
| **Claim 4 (Generalization)** | $G$ | Sequential verification-before-selection gating | `schemas/protocol_v1.json` | `examples/constraint_demo/demo.js` | SCADA Modbus Interlock evaluation |
| **Claim 5 (Distributed Core)**| $N \circ \Psi$ | Multi-node consensus state reconciliation | `schemas/protocol_v1.json` | `examples/replay_demo/demo.js` | `ConsensusReconciler` vote test |
| **Claim 6 (Hardware stabilization)**| $\Sigma$ | Memory-controller commit boundary | `schemas/execution_proof_v1.json` | `examples/constraint_demo/demo.js` | Enclave status locks |
| **Claims 4–8 (Verification)** | $\Omega$ | Safety policy & invariant evaluation | `schemas/protocol_v1.json` | `examples/constraint_demo/demo.js` | `ExecutionGatedAssertionEngine` |
| **Claims 9–12 (Normalization)**| $N$ | Concurrency resolution & hash ordering | `schemas/protocol_v1.json` | `examples/replay_demo/demo.js` | Active register map alignment |
| **Claims 13–16 (Selection)**  | $\Psi$ | Majority voting & tie-breaking | `schemas/protocol_v1.json` | `examples/replay_demo/demo.js` | $2/3$ agreement threshold checks |
| **Claims 17–20 (Stabilization)**| $\Sigma$ | Atomic commit vs. unverified rollback | `schemas/execution_proof_v1.json`| `examples/constraint_demo/demo.js` | Enclave lock-state transitions |
| **Claims 21–23 (Rollback)**   | $R(S_v, S_c)$ | Clock cycle freezing and register wipes | `schemas/execution_proof_v1.json`| `examples/replay_demo/demo.js` | Node resynchronization rollback |
| **Claims 24–27 (Replay / Audit)**| $\mathcal{R}$ | Historical trace reconstruction from WAL | `schemas/audit_bundle_v1.json` | `examples/audit_bundle_demo/demo.js` | JSON format dump & validation |
| **Claims 28–32 (Distributed)** | $N \circ \Psi$ | State convergence using peer proof packets| `schemas/protocol_v1.json` | `examples/replay_demo/demo.js` | Multilateral consensus voting loop |
| **Claims 33–36 (Security)**    | $\Omega$ | Cryptographic signature validation in enclaves| `schemas/protocol_v1.json` | `examples/audit_bundle_demo/demo.js` | Ed25519 signature checks |
| **Claims 37–40 (Hardware)**   | $\Sigma$ | Memory controller / FPGA accelerators | `schemas/execution_proof_v1.json`| `examples/hello_world/demo.js` | Isolated physical register arrays |
| **Claims 41–45 (Applications)**| $G$ | SCADA, Industrial, and Finance controls | `schemas/claim_graph_v1.json` | `examples/claim_graph_demo/demo.js` | `test_register_level_isolation` |

---

## 🏛️ Decision Log Mapping

Evaluators seeking to understand the architectural trade-offs, constraints, and motivations behind each component can audit the associated **Architectural Decision Records (ADRs)**:
1. **Deterministic Floating-Point Strategy**: 📘 **[`docs/adr/0001-deterministic-runtime.md`](/docs/adr/0001-deterministic-runtime.md)** $\rightarrow$ Maps to **Claims 5, 9–12 (Normalization)**.
2. **Legal Claim Alignment**: 📘 **[`docs/adr/0002-claim-graph-traceability.md`](/docs/adr/0002-claim-graph-traceability.md)** $\rightarrow$ Maps to **Claims 41–45 (Industrial Applications)**.
3. **Decentralized Audit Ledgers**: 📘 **[`docs/adr/0003-audit-bundle-wal.md`](/docs/adr/0003-audit-bundle-wal.md)** $\rightarrow$ Maps to **Claims 24–27 (Replay & WAL)**.
4. **Isolated Memory Pipelines**: 📘 **[`docs/adr/0004-egaf-separation.md`](/docs/adr/0004-egaf-separation.md)** $\rightarrow$ Maps to **Claims 4, 17–20 (Stabilization & Rollback)**.
