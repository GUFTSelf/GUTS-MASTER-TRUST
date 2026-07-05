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
