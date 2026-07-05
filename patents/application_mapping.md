# USPTO Application to Software Component Mapping

This matrix establishes direct physical engineering traceability between the **GUTS MASTER TRUST** patent applications and the compiled software components/crates inside this evaluation repository.

---

## 🗺️ Application-to-Crate Map

### 1. Application: USPTO 19/679,674 (Verifiable Execution Kernel)
* **Software Crate**: `crates/vek-core` and `crates/vek-runtime`
* **Core Implementation Files**:
  * `crates/vek-core/src/vm.rs` — Configures the 32-register instruction-level execution sandbox.
  * `crates/vek-core/src/registers.rs` — Manages cycle-accurate state snapshots.
  * `crates/vek-runtime/src/witness.rs` — Compiles the algebraic verification witnesses.
* **Console Representation**: Interactively tested under **Licensing** -> **Claim-to-Implementation Matrix** -> **19/679,674 - Claim 1**.

### 2. Application: USPTO 19/541,415 (Deterministic Validation of Stochastic AI Outputs)
* **Software Crate**: `crates/vek-core` (Validation Layer)
* **Core Implementation Files**:
  * `crates/vek-core/src/constraint_registry.rs` — Evaluates token strings against pre-registered safety rules in real-time.
  * `crates/vek-core/src/policy.rs` — Dictates state-transition block and rollback logic.
* **Console Representation**: Interactively tested under **Licensing** -> **Claim-to-Implementation Matrix** -> **19/541,415 - Claim 1** & **Claim 2**.

### 3. Application: USPTO 19/551,611 (Identity-Locked Operating System)
* **Software Component**: `src/components/OracleIdentityPanel.tsx`
* **Core Implementation Files**:
  * `src/components/OracleIdentityPanel.tsx` — Simulates biometric and decentralized ID validation before granting console permissions.
* **Console Representation**: **Oracle Identity** tab panel.

### 4. Application: USPTO 19/564,148 (Sovereign Deterministic Infrastructure)
* **Software Service**: `services/execution-service`
* **Core Implementation Files**:
  * `services/execution-service/src/boundary.rs` — Intercepts unwhitelisted system socket calls inside the container.
  * `services/execution-service/Dockerfile` — Deploys the isolated secure sandbox chamber.
* **Console Representation**: Interactively tested under **Licensing** -> **Claim-to-Implementation Matrix** -> **19/564,148 - Claim 1**.

### 5. Application: USPTO 19/553,535 (Memory Synchronization Module)
* **Software Crate**: `crates/vek-storage`
* **Core Implementation Files**:
  * `crates/vek-storage/src/wal.rs` — Reconciles sequential write timestamps across memory structures.

### 6. Application: USPTO 19/682,427 (Autonomous Network Provisioning)
* **Software Service**: `services/replay-service`
* **Core Implementation Files**:
  * `services/replay-service/src/reconciler.rs` — Manages multi-node consensus communication over peer-to-peer secure sockets.
* **Console Representation**: **Protocol** and **Replay** tab panels.
