# VEK Semantic Core Specification (VEK-SCS)
## Version 1.0.0 — Canonical Specification of Verifiable Execution

This document establishes the **VEK Semantic Core Specification (VEK-SCS)**, serving as the single, authoritative mathematical and logical source of truth for the Verifiable Execution Kernel (VEK). All implementations (including Rust core modules, Python wrappers, and TypeScript visualization overlays) must align with the formalisms, state transitions, and safety invariants defined herein.

---

## 📐 1. Formal Mathematical Execution Model

The Verifiable Execution Kernel operates as a discrete, state-space constrained, deterministic state-transition system.

### 1.1 State Definition ($S$)
A state $S_t$ at any logical clock cycle $t \in \mathbb{N}$ is a tuple:
$$S_t = \langle R_t, M_t, \tau_t, \Pi_t, K_t \rangle$$

Where:
* $R_t \in \mathbb{Z}^{32}$: The Register File, representing $32$ register slots of 32-bit signed integer values.
* $M_t: \mathbb{Z} \rightarrow \mathbb{Z}$: Memory State, mapping 32-bit memory addresses to 32-bit integer values.
* $\tau_t \in \mathbb{N}$: Monotonic Logical Clock, counting sequential cycles executed without divergence.
* $\Pi_t \in \{\text{Active}, \text{Quarantined}, \text{Isolated}, \phi\}$: Node Operational Policy State, where $\phi$ is the fail-hard terminal state.
* $K_t \in \mathcal{H}$: Forensic Cryptographic Accumulator, representing the cumulative SHA-512 state hash up to cycle $t$.

### 1.2 Input Command ($I$)
An input transaction or instruction $I_t$ is a tuple:
$$I_t = \langle \text{opcode}, \text{args}, \sigma_t \rangle$$
Where:
* $\text{opcode}$: The operation to execute (e.g., `LOAD_IMM`, `ADD`, `SYS_CALL_INTERCEPT`).
* $\text{args}$: Operation-specific parameters (e.g., destination registers, memory offsets, raw port addresses).
* $\sigma_t$: An Ed25519 digital signature certifying source authenticity and packet integrity.

### 1.3 State Transition Function ($\delta_e$)
The deterministic state transition is defined by the function $\delta_e$:
$$\delta_e(S_t, I_t) \rightarrow S_{t+1}$$

$$\delta_e(S_t, I_t) = \begin{cases} 
      S_{t+1} = \langle R_{t+1}, M_{t+1}, \tau_t + 1, \text{Active}, K_{t+1} \rangle & \text{if } \Omega(S'_t) = \text{Valid} \\
      S_{t+1} = \langle R_t, M_t, \tau_t, \text{Isolated}, K_t \rangle & \text{if } \Omega(S'_t) = \text{DriftDetected} \\
      \phi & \text{if } \Omega(S'_t) = \text{SafetyViolation} 
   \end{cases}$$

Where:
* $S'_t = F(S_t, I_t)$ represents the raw, uncommitted candidate state calculated by the transition execution operator $F$.
* $\Omega$ represents the evaluation predicate verifying that the candidate state $S'_t$ satisfies all system boundaries and policy invariants.

---

## 🔒 2. Authoritative Policy Invariants

To guarantee deterministic, safe, and verifiable operation, any compliant implementation must enforce the following six core logical invariants ($D_1$ through $D_6$) at every state transition boundary:

### $D_1$: Execution-Gated Assertion Constraint
Candidate computation ($F$) and policy verification ($\Omega$) must be strictly decoupled.
* **Formalization**:
  $$\forall t: S_{t+1} \text{ is written to physical/durable storage } \Sigma \iff \Omega(F(S_t, I_t)) = \text{Valid}$$
  No candidate state $S'_t$ may mutate the persistent ledger or output ports until $\Omega(S'_t)$ resolves successfully.

### $D_2$: Float-Drift Convergence Constraint
Distributed redundant enclaves must produce exact binary equivalence across heterogeneous compilers and instruction set architectures.
* **Formalization**:
  If non-integer operations are performed, they must use deterministic fixed-point scaling:
  $$\forall \text{ node } A, B \in \mathcal{N}: R^A_{t, i} = R^B_{t, i} \quad \forall i \in [0..31]$$
  If $R^A_{t, i} \neq R^B_{t, i}$, the divergence reconciler must quarantine the divergent node within $1$ clock cycle.

### $D_3$: Monotonic Logical Clock Constraint
Logical clock cycles must progress strictly monotonically.
* **Formalization**:
  $$\tau_{t+1} > \tau_t \iff S_t \rightarrow S_{t+1} \text{ is validated and committed}$$
  $$\tau_{t+1} = \tau_t \iff S_t \text{ undergoes Rollback Recovery}$$

### $D_4$: Secure Enclave Boundary Constraint
The verification operator $\Omega$ must execute inside a hardware-isolated environment with attested integrity.
* **Formalization**:
  $$\text{AttestationSignature}(\Omega) \in \mathcal{P}_{\text{Trusted}}$$
  Any modification to the verification ruleset invalidates the enclave's cryptographic status, triggering system lock.

### $D_5$: Policy-Violation Terminal Isolation Constraint ($\phi$)
Upon encountering an irrecoverable safety policy breach, the system must immediately transition to the fail-hard terminal state $\phi$.
* **Formalization**:
  $$\exists c \in \text{SafetyPolicies} : c(S'_t) = \text{False} \implies S_{t+1} = \phi$$
  In state $\phi$, all physical PLC output lines are grounded, the virtual clock freezes, and a permanent cryptographic seal is outputted.

### $D_6$: Tamper-Evident WAL Consensus Continuity
Every state transition must be appended to a cryptographic write-ahead log (WAL) signed by the active enclave.
* **Formalization**:
  $$K_t = \text{SHA-512}(K_{t-1} \parallel \text{Serialize}(R_t, M_t, I_t))$$
  $$S_{t+1} \text{ is valid} \implies \text{VerifySignature}(K_{t+1}, \sigma_{t+1}) = \text{True}$$

---

## 👁️ 3. Three Categories of Truth

To maintain structural clarity and prevent semantic drift across multi-tier applications, we formalize three distinct, non-overlapping categories of truth:

| Dimension | Type of Truth | Canonical Definition | Responsibility |
| :--- | :--- | :--- | :--- |
| **I** | **Operational Truth** | What the high-performance kernel (Rust Core) actually executes. | Computes raw $F(S_t, I_t)$, manages physical page tables, and executes raw machine cycles. |
| **II** | **Observational Truth** | What the system console and web dashboard (TypeScript UI) display. | Visualizes traces, charts latency metrics, and renders real-time state vectors for human audits. |
| **III** | **Formal Truth** | What the mathematical specification (Lean/TLA+ models) validates. | Proves that the transition function $\delta_e$ satisfies safety invariants under all possible interleavings. |

### Alignment Guarantee
To prevent multi-runtime divergence (the "semantic gap"), a strict serialization protocol is enforced:
1. **Rust Core (Operational)** emits verifiable JSON state bundles matching `schemas/audit_bundle_v1.json`.
2. **TypeScript Web Visualizer (Observational)** parses and renders the exact JSON state bundles. Any rendering component must strictly mirror the logical state:
   $$\text{Render}(S_t) \equiv S_t^{\text{Operational}}$$
3. **Formal Verification (Formal)** models the state transition $\delta_e$ as a set of inductive invariants.

---

## 🚨 4. Failure & Recovery Semantics

### 4.1 Fail-Hard Terminal State ($\phi$)
When an interlock or invariant (e.g., Modbus address boundary breach, battery cell voltage violation) is violated, the system triggers `BLOCK_EMERGENCY_HALT`:
1. **Physical Bus Locking**: The physical PLC clock cycles are immediately frozen (simulated via register lock).
2. **Isolation**: All external communication ports are closed, isolating the enclave from network grids.
3. **Forensic Sealing**: The kernel generates an Emergency Audit Seal (SHA-512) incorporating the full execution trace up to the failure point:
   $$\text{Seal} = \text{SHA-512}(K_{\tau} \parallel \text{ViolationContext})$$

### 4.2 Rollback Recovery (Consensus Drift Rollback)
When a node's state diverges due to hardware/float drift, the Consensus Reconciler executes:
1. **Majority Voting**: Compares the state digest $K_t$ across all redundant nodes.
2. **Quarantine**: If node $C$ has a mismatching hash, it is quarantined immediately.
3. **Rollback**: Node $C$'s memory is wiped and rewound to the last known-good consensus state $S_{t-k}$ ($0.25$ ms typical latency SLA).
4. **Resynchronization**: Replays the transaction block from $t-k$ to $t$ using the deterministic scaling layer to align with the active majority pool.

---

## 🎯 5. Multi-Runtime Alignment & Drift Avoidance

To prevent semantic drift, the development lifecycle enforces these strict constraints:
1. **No Shared Floating Point**: Any float representation must be scaled to fixed-point integer math before storage or verification.
2. **Schema Integrity**: Every API endpoint and state mutation message must validate against `/schemas/protocol_v1.json`.
3. **Syntax and Static Guarantees**: Continuous Integration (CI) executes strict TypeScript compilation (`tsc --noEmit`) and Cargo-based verification pipelines to guarantee that operational and observational structures remain perfectly synchronized.
