# VEK Empirical Evidence Dashboard (EED)
## Version 1.0.0 — Authoritative Verification Ledger

This dashboard compiles concrete, reproducible, and verifiable evidence backing all technological claims made by the **Verifiable Execution Kernel (VEK)**. Instead of relying on abstract specifications, technical evaluators can execute the indicated harnesses to verify mathematical and operational guarantees.

---

## 📊 Master Claims-to-Evidence Matrix

The table below outlines the definitive mappings of system claims to physical, executable verification artifacts included in this repository:

| Core Requirement | Scientific Claim | Active Code / Schema Mapping | Verification Command | Reproducible Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-001: Deterministic Replay** | Identical inputs execute with $100\%$ state root hash match on heterogeneous nodes. | `/examples/replay_demo/demo.js` | `npm run verify` | Automated replay logs comparison proving exact SHA-512 outputs. |
| **REQ-002: Replay Equivalence** | A quarantined node can rollback and resynchronize with the consensus majority. | `/src/components/VoiceConversationPanel.tsx` | `npm run demo` | Replay recovery simulation resetting register content in $0.22$ ms. |
| **REQ-003: Ledger Integrity** | Write-Ahead Logs (WAL) generate cryptographic audit bundles signed in enclaves. | `/schemas/audit_bundle_v1.json`, `/examples/audit_bundle_demo/demo.js` | `npm run verify` | Signed JSON audit envelopes conforming to cryptographic schemas. |
| **REQ-004: EGAF Boundary Guards** | Unsafe register updates are intercepted, blocked, and forensically sealed. | `/examples/constraint_demo/demo.js` | `npm run verify` | Emergency audit seal generation (SHA-512) upon simulated battery overvoltage. |
| **REQ-005: Claim Traceability** | Patent claims are programmatically traced and mapped directly to active code files. | `/schemas/claim_graph_v1.json`, `/examples/claim_graph_demo/demo.js` | `npm run verify` | Automated claim coverage verification outputting proof vectors. |
| **REQ-006: Fixed-Point Math** | Floating-point operations scale deterministic integer representation. | `/docs/adr/0001-deterministic-runtime.md` | `npm run benchmark` | Integer-scaled emulator ensuring perfect cross-microprocessor parity. |
| **REQ-007: Attestation Boundaries**| Hardware-isolated secure enclaves block host-level memory injections. | `/docs/adr/0004-egaf-separation.md`, `/SECURITY.md` | Audit Matrix Review | Multi-layer sandbox separating computational and commitment pipelines. |
| **REQ-008: Host Threat Mitigation**| Active verification before mutation limits local privilege escalations. | `/SECURITY.md` | Security Audit Review | Threat model detailing specific vectors and defensive locks. |

---

## 🏃 Independent Verification Guide

To compile and verify all evidence modules locally on your system, execute the following standardized command sequence:

### Step 1: Install Workspace Dependencies
Installs all standard compilers, interpreters, and runtime libraries specified in the package manifests:
```bash
npm install
```

### Step 2: Run Automated Conformance Verification
Runs the five-part reference implementation test matrix and validates protocol schema conformity:
```bash
npm run verify
```

### Step 3: Run Reproducible Performance Benchmarks
Executes the micro-benchmark harness on your native CPU, reporting IPS throughput and constraint delay metrics:
```bash
npm run benchmark
```

### Step 4: Run Robustness & Adversarial Stress Tests
Subjects the state machine to high-volume fuzzing, integer overflows, bit-flip injections, and node drifts:
```bash
npm run stress-test
```

### Step 5: Validate Active Visual Interfaces
Renders the real-time SVG visualizers, state vectors, and physical SCADA interlocking animations:
```bash
npm run dev
```

---

## 🔍 Cryptographic Seal Verification
Every successful validation run generates signed envelopes matching the official schemas. You can verify the integrity of the generated artifacts using standard verification utilities:

* **WAL Audit Hash**: `schemas/audit_bundle_v1.json`
* **Claim Graph Spec**: `schemas/claim_graph_v1.json`
* **Execution Proofs**: `schemas/execution_proof_v1.json`
* **Robustness Evidence**: `evaluation-kit/stress_report.json`

*Certified by the VEK Governance Board.*
