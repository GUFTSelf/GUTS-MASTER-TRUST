# ARCHITECTURE.md

## VEK Technical Architecture & Source Structure

This document outlines the software engineering layout of the Verifiable Execution Kernel (VEK) platform. The repository is structured as a full-stack, modular monorepo containing our core Rust crates, auxiliary microservices, and our high-assurance web-based administrative console.

---

### 1. Conceptual Module Hierarchy

The platform is divided into three distinct conceptual layers:

```
┌────────────────────────────────────────────────────────┐
│               MANAGEMENT & MONITORING                  │
│  • vek-console (React SPA)                             │
│  • sdk-typescript (Client connector)                   │
└───────────────────────────┬────────────────────────────┘
                            │ (JSON-RPC / WebSockets)
                            ▼
┌────────────────────────────────────────────────────────┐
│                SERVICES & INTEGRATIONS                 │
│  • services/replay-service (Consensus & Float Reconcil)│
│  • services/execution-service (Linux sandbox & boundaries)│
│  • services/audit-service (Signed WAL ledger/attest)   │
└───────────────────────────┬────────────────────────────┘
                            │ (Direct Rust FFI / Static link)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   VEK KERNEL CRATES                    │
│  • crates/vek-core (Isolated VM, registers, policy)    │
│  • crates/vek-runtime (Witness compiler, STARK traces)  │
│  • crates/vek-storage (Write-Ahead Log, WAL binary format)│
│  • crates/vek-crypto (SHA-512, Ed25519 enclaves)       │
└────────────────────────────────────────────────────────┘
```

---

### 2. Physical File & Directory Map

Below is the layout of our technology evaluation repository:

```
GUTS-MASTER-TRUST
├── README.md                      ← Executive Landing Page & IP Directory
├── LICENSE-EVALUATION.md          ← Formal Evaluation agreement & setup
├── TECHNOLOGY_OVERVIEW.md         ← Mathematical & Determinism Concept
├── ARCHITECTURE.md                ← [THIS FILE] Source layout & module map
├── BENCHMARKS.md                  ← Drift metrics, TPS & Latency reports
├── SECURITY.md                    ← Boundary enforcement & Cryptographic specs
├── CHANGELOG.md                   ← Pipeline release history
│
├── licensing/
│   └── Contact.md                 ← Business/legal corporate contacts
│
├── patents/
│   ├── portfolio.md               ← GUTS MASTER TRUST Patent portfolio list
│   ├── application_mapping.md     ← USPTO application-to-crate alignments
│   └── claim_traceability.md      ← Detailed USPTO claim-to-source map
│
├── crates/
│   ├── vek-core/
│   │   └── src/
│   │       ├── vm.rs              ← 32-register instruction-level VM
│   │       ├── registers.rs       ← Cycle-accurate register definitions
│   │       ├── policy.rs          ← Real-time SCADA policy enforcement
│   │       └── constraint_registry.rs ← Invariant registration & checks
│   ├── vek-runtime/
│   │   └── src/
│   │       └── witness.rs         ← Polynomial commitment compiler
│   ├── vek-storage/
│   │   └── src/
│   │       └── wal.rs             ← Tamper-resistant Write-Ahead Logs
│   └── vek-crypto/
│       └── src/
│           └── sha512.rs          ← High-security salted cryptographic hash
│
├── services/
│   ├── execution-service/         
│   │   ├── Dockerfile             ← Isolated deployment container
│   │   └── src/
│   │       └── boundary.rs        ← System call interception (socket filter)
│   ├── replay-service/
│   │   └── src/
│   │       └── reconciler.rs      ← Floating point drift voter & consensus
│   └── audit-service/
│       └── src/
│           ├── ledger.rs          ← Verification storage & auditable ledger
│           └── attestation.rs     ← Enclave-signed firmware attestation
│
└── src/                           ← VEK Console administrative applet
    ├── App.tsx                    ← Core SPA entry, router, and tab panels
    ├── index.css                  ← Inter/JetBrains Mono typography definitions
    ├── types.ts                   ← Common JSON schemas & audit types
    └── components/
        ├── CimMatrix.tsx          ← Inter-active Claim-to-Implementation matrix
        ├── Dashboard.tsx          ← Core transaction telemetry dashboard
        ├── OracleIdentityPanel.tsx← Identity-locked verification logs
        ├── Platform.tsx           ← High-level enterprise status monitors
        ├── Protocol.tsx           ← Interactive byte-stream visualizer
        └── Workspace.tsx          ← Administrative command-line shell
```

---

### 3. Component Interoperability

1. **Cycle Tracing**: When high-assurance software runs, the `VirtualMachine` in `vek-core` records each step.
2. **Commitment Compiling**: The `ExecutionWitness` compiled by `vek-runtime` takes the sequential trace and calculates polynomial verification roots.
3. **Storage Security**: The `WriteAheadLog` in `vek-storage` saves the record blocks to disk, chaining them sequentially with a SHA-512 seal.
4. **Boundary Control**: If the sandboxed code tries to escape (e.g. executing an unauthorized TCP connect), `execution-service` intercepts the syscall and freezes the sandbox.
5. **Drift Resolution**: The `Reconciler` in `replay-service` monitors parallel enclaves, matches their state hashes, and drops any node displaying single-precision deviation.
6. **Console Visualization**: The administrative React console (in `/src`) displays all these real-time streams in an elegant, high-contrast dashboard with live, interactively triggerable simulations.

---

### 4. Structural Sequence & Data Flow Diagram

This diagram maps out the end-to-end execution lifecycle, showing how visual operations on the Console trigger back-end execution, invariant checks, consensus reconciliation, and cryptographic storage.

```
┌────────────────────────────────────────────────────────┐
│                        Console                         │
│  (Trigger simulations, request audit metrics, monitor) │
└───────────────────────────┬────────────────────────────┘
                            │ (HTTPS / WebSocket Request)
                            ▼
┌────────────────────────────────────────────────────────┐
│                      Server API                        │
│  (Express back-end routes: /api/execute, /api/logs)    │
└───────────────────────────┬────────────────────────────┘
                            │ (Dispatch Job Payload)
                            ▼
┌────────────────────────────────────────────────────────┐
│                       Scheduler                        │
│  (Allocates jobs, synchronizes execution clock ticks)   │
└───────────────────────────┬────────────────────────────┘
                            │ (Instantiate Core Enclave)
                            ▼
┌────────────────────────────────────────────────────────┐
│                      VEK Runtime                       │
│  (Cycle-accurate instruction execution and VM traces)  │
└───────────────────────────┬────────────────────────────┘
                            │ (Emit Raw Execution Trace)
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Replay Engine                      │
│  (Matches state hashes across nodes, isolates drift)   │
└───────────────────────────┬────────────────────────────┘
                            │ (Verify States Against Rules)
                            ▼
┌────────────────────────────────────────────────────────┐
│                         EGAF                           │
│ (Execution-Gated Assertion Framework: check invariants)│
└───────────────────────────┬────────────────────────────┘
                            │ (Compile Proof Commitment)
                            ▼
┌────────────────────────────────────────────────────────┐
│                      Audit Bundle                      │
│ (Write cryptographically signed WAL to disk ledger)   │
└────────────────────────────────────────────────────────┘
```

---

### 5. Subsystem Interface Specifications

These formal specifications define the contractual boundaries, expected behaviors, and fault-tolerance mechanics of the five core VEK components.

#### A. VEK Runtime (Execution Kernel)
* **Description**: The core cycle-accurate virtual machine executing virtual instructions inside secure hardware sandboxes.
* **Inputs**:
  * `program_bytes`: The binary payload to execute.
  * `initial_registers`: Starting state of the 32-register array.
  * `cycles_limit`: Hard maximum limit of CPU cycles before halting.
* **Outputs**:
  * `terminal_state_hash`: SHA-512 of final registers and memory space.
  * `cycle_trace`: Chronological array of program counters, register logs, and memory delta records.
* **Guarantees**: 100% architectural determinism; zero-entropy leakage; instruction evaluation is strictly sequence-bound.
* **Failure Modes**:
  * *OverflowHalt*: Triggers when `cycles_limit` is exceeded. Sandbox is frozen and current registers are serialized.
  * *IllegalInstruction*: Halts instantly upon encountering an invalid op-code, locking the system state.

#### B. Execution-Gated Assertion Framework (EGAF)
* **Description**: Inline evaluation framework mapping system states directly to hard-coded mathematical constraints.
* **Inputs**:
  * `current_state`: Active register mappings, memory values, or Modbus signals.
  * `invariant_rules`: Pre-compiled assertions mapping state limits (e.g. pressure $\le 4200$).
* **Outputs**:
  * `validation_status`: Boolean (Pass / Violate).
  * `assertion_proof`: Diagnostic packet containing the program counter and register values causing any failure.
* **Guarantees**: Invariant checks run on every single instruction cycle; no instruction can complete execution unless validation passes.
* **Failure Modes**:
  * *InvariantViolation*: Triggers immediate high-priority emergency rollback, locking register space and outputting a signature seal.

#### C. Replay Engine (Consensus Reconciler)
* **Description**: Monitors and reconciles parallel enclaves, isolating multi-platform CPU float and clock drift.
* **Inputs**:
  * `node_state_hashes`: Array of SHA-512 state commitments from multiple redundant executing nodes.
  * `drift_threshold`: Allowed variance parameters (strictly zero for deterministic variables).
* **Outputs**:
  * `consensus_state_hash`: Approved master hash (requires $\ge 2/3$ agreement).
  * `quarantine_list`: Array of platform IDs exhibiting divergent registers or float drift.
* **Guarantees**: Identifies and isolates unaligned nodes within $0.25\text{ ms}$; guarantees downstream ledger determinism.
* **Failure Modes**:
  * *ConsensusFailure*: Occurs when less than 2/3 of nodes agree on a state hash. Triggers emergency system-wide halt.

#### D. Scheduler (Task Orchestrator)
* **Description**: Orchestrates job queues, binds virtual threads, and sets global clock cycles.
* **Inputs**:
  * `job_queue`: Ordered list of tasks ready for VM compilation.
  * `system_clock`: Monotonic timing input regulating active enclaves.
* **Outputs**:
  * `allocated_enclaves`: Mappings of active tasks to isolated sandbox environments.
  * `execution_orders`: Sequenced batches dispatched to individual execution pipes.
* **Guarantees**: FIFO sequencing of high-priority transactions; enforces fair CPU cycles allotment.
* **Failure Modes**:
  * *ResourceStarvation*: Occurs if enclaves fail to spawn. Automatically rolls back pending queue.

#### E. Storage System (Write-Ahead Log)
* **Description**: Appends execution logs and cryptographic state proofs to binary log files on non-volatile storage.
* **Inputs**:
  * `audit_block`: Packed execution records, transaction signatures, and block hash chains.
* **Outputs**:
  * `committed_block_id`: Unique index representing durable write completion.
  * `tamper_evidence_proof`: Salted SHA-512 chain link proving chronological order.
* **Guarantees**: Immediate durability; sequential append-only locks prevent log truncation or retro-active edits.
* **Failure Modes**:
  * *WriteFailure (Disk Full)*: Instantly halts the associated execution pipe to prevent unlogged transactions.
