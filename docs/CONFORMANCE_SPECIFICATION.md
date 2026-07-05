# VEK Platform Conformance Specification

This specification establishes the official requirements and objective criteria that an implementation must satisfy to claim compatibility and compliance with the Verifiable Execution Kernel (VEK) specification.

---

## 🎖️ Conformance Levels

We define three progressive levels of compliance to allow developers to build, test, and license the technology in modular tiers.

```text
               ┌──────────────────────────────────────────────┐
               │    Level 3: Full Enclave & HW Rollback       │
               └──────────────────────┬───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │    Level 2: Deterministic Replay & Normal     │
               └──────────────────────┬───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │    Level 1: Pipeline Verification & Schemas  │
               └──────────────────────────────────────────────┘
```

### 1. Conformance Level 1: Core Pipeline & Schema Compatibility
This level ensures an implementation successfully maps to the mathematical 6-stage operator sequence and exchanges compliant artifacts.

* **Requirement 1.1: Functional Pipeline Mapping**
  The runtime must execute transitions sequentially through:
  $$G = \Sigma \circ \Psi \circ N \circ \Omega \circ P \circ F$$
  * *Verification*: Any transition must produce a candidate state before persistent stabilization occurs.
* **Requirement 1.2: Schema Alignment**
  The implementation must import and validate all outgoing and incoming transaction artifacts against the published schemas:
  - `audit_bundle_v1.json` (signed transaction logs)
  - `claim_graph_v1.json` (legal claim mapping)
  - `execution_proof_v1.json` (zk-witness constraints)

### 2. Conformance Level 2: Deterministic Replay & Drift Resolution
This level ensures an implementation is capable of running redundant distributed enclaves without state divergence.

* **Requirement 2.1: Floating-Point Drift Resolution**
  All arithmetic inside the transition function ($F$) must be strictly deterministic across heterogeneous compilers and OS runtimes.
  - *Metric*: Software-level integer scaling or fixed-point representations must be used for non-integer computations.
* **Requirement 2.2: Active Quarantine & Majority Consensus**
  Upon multi-node state mismatch, the system must resolve consensus using a strict majority voting mechanism ($2/3$ minimum) and isolate the divergent node.

### 3. Conformance Level 3: Hardware Enclave & Atomic Rollback
This is the highest level of compliance, securing the kernel against hardware-level and kernel-level compromise.

* **Requirement 3.1: Secure Enclave Execution**
  The verification predicate ($\Omega$) must execute within a hardware-isolated environment (e.g., AMD SEV, Intel SGX, or dedicated FPGA/ASIC partition).
* **Requirement 3.2: Atomic Memory Rollback**
  If verification fails, the system must revert memory states at the controller/hardware level, completely wiping candidate scratchpads within one clock cycle.

---

## 📋 Conformance Check Matrix

| Feature Requirement | Level 1 | Level 2 | Level 3 | Verification Evidence |
| :--- | :---: | :---: | :---: | :--- |
| Six-Stage Operator $G$ | **MANDATORY** | **MANDATORY** | **MANDATORY** | Trace logs mapping $F \rightarrow P \rightarrow \Omega \rightarrow N \rightarrow \Psi \rightarrow \Sigma$. |
| Strict JSON Validation | **MANDATORY** | **MANDATORY** | **MANDATORY** | Parse validation of output files. |
| Deterministic Arithmetic| - | **MANDATORY** | **MANDATORY** | Verified drift-free performance across heterogeneous enclaves. |
| Consensus Voter Protocols| - | **MANDATORY** | **MANDATORY** | Active majority agreement and node resynchronization logs. |
| Hardware Isolation (TEE)| - | - | **MANDATORY** | Remote attestation and memory encryption signatures. |
| Controller-Level Rollback| - | - | **MANDATORY** | Hardware-level bus locking on policy violation. |
