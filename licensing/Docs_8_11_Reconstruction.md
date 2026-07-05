# GUTS MASTER TRUST Technology Evaluation Dossier
## Documents 8–11 Technical Reconstruction Package

This package contains the technical specifications and implementation protocols for **Documents 8, 9, 10, and 11** of the VEK corporate licensing portfolio. These documents detail the low-level mathematical, hardware, cryptographic, and industrial systems interfaces of the Verifiable Execution Kernel.

---

## Doc 8: Single-Precision Floating-Point Drift Mitigation Procedure

### 1. The Core Numerical Discrepancy
In distributed high-performance consensus enclaves, heterogeneous host architectures (e.g., AMD EPYC x86_64 vs. Apple M-Series ARM64 vs. Intel Xeon) execute floating-point operations with minor binary representation variances. Under IEEE 754:
* **Fused Multiply-Add (FMA)**: Some microprocessors combine $x \times y + z$ into a single operation with one rounding step, whereas older processors execute them sequentially with two rounding steps.
* This difference results in a **1-bit LSB (Least Significant Bit) deviation** after several thousand cycles, cascading into divergent state hashes across redundant nodes, destroying determinism.

### 2. The VEK Floating-Point Reconciliation Algorithm
VEK bypasses standard host FPU execution for critical policy checks by routing mathematical operations through a **drift-free software-defined float engine** inside `crates/vek-core`. 

```
[Mathematical Expression]
        │
        ▼
┌───────────────────────────────────────┐
│       IEEE 754 Software Parser        │
│   (Forbids hardware-native FPUs)      │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│    Integer-Scaled Fixed-Point ALU     │
│   (Registers scaled to 128-bit int)   │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│     Multi-Node Consensus Voter        │
│   (2/3 validation threshold match)    │
└───────────────────────────────────────┘
```

When a native float calculation is absolutely necessary:
1. Operations are partitioned into fixed-point integers using a customizable scalar (e.g., $10^9$ for nano-precision).
2. If any node's output diverges from the median-voted consensus hash, `replay-service` triggers a state rollback to the last confirmed epoch, isolates the drifting node, and dispatches a signature sync packet.

---

## Doc 9: Secure Enclave (TEE) Onboarding & Firmware Setup

To achieve hardware-level tamper-resistance, the Verifiable Execution Kernel is compiled to run inside a **Trusted Execution Environment (TEE)** (e.g., AWS Nitro Enclaves, Intel SGX, or AMD SEV-SNP).

### 1. Trusted Bootstrapping Sequence
1. **Measurement (MRENCLAVE)**: Upon boot, the hardware security module (HSM) measures the binary image of the VEK VM and stores the SHA-256 measurement in Platform Configuration Register 0 (PCR0).
2. **Key Generation**: The internal secure enclave generates a temporary, localized Ed25519 key pair. The private key remains strictly within the enclave's read-only cache lines.
3. **Attestation Quote**: The enclave requests a hardware-signed attestation quote containing the PCR0 measurement, the public key, and the host's physical processor serial number.
4. **Licensing Oracle Registration**: The attestation quote is dispatched to GUTS MASTER TRUST's licensing oracles. Upon verification of the quote against Intel/AMD root certificates, a licensing lease is cryptographically signed and injected back into the enclave.

---

## Doc 10: Ed25519 PCR Lifecycle & Revocation

### 1. Platform Configuration Registers (PCR) Mapping
VEK binds runtime capabilities directly to specific PCR measurements to prevent modified firmware or unauthorized side-cars from accessing sensitive registers:

| Register | Measured Value | Security Association |
| :--- | :--- | :--- |
| **PCR0** | Kernel Binary Measurement | Assures no code-injection or modification of VEK bytecode. |
| **PCR1** | Invariant Constraint Set SHA-512 | Locks the active policy contract and SCADA safety parameters. |
| **PCR2** | Developer Identity Credentials | Verifies the authorized biometric key signed by Oracle Identity. |

### 2. Enclave Key Revocation Logic
If an isolation boundary breach is detected by `services/execution-service` (e.g., unauthorized memory access or unwhitelisted network socket calls):
1. **Memory Purge**: The active kernel intercepts the syscall and instantly zeroizes the memory locations containing the private Ed25519 attestation key.
2. **Ephemeral Revocation**: An emergency broadcast transaction is emitted to the consensus ledger, notifying all peer enclaves to add the compromised key's fingerprint to the Revocation List.
3. **Firmware Lockdown**: The physical host remains quarantined until a biometric master reset is executed by the designated GUTS MASTER TRUST administrative operator.

---

## Doc 11: SCADA Policy Map & Industrial Controller Integration

The VEK Policy Contract Layer acts as an inline interlock for critical infrastructure control loops (e.g., PLCs, RTUs, power grids, battery management).

### 1. Protocol Interception (Modbus/TCP & DNP3)
Standard industrial protocols lack built-in security, making them vulnerable to malicious overrides. VEK sits as a transparent, high-assurance inline filter:

```
[SCADA Master HMI Command]
           │
           ▼ (Modbus write to Holding Register 40015)
┌───────────────────────────────────────┐
│     VEK Boundary Interceptor          │
│ (Locks write access based on Policy)  │
└───────────────┬───────────────────────┘
                ├─────────────────────────────────────────┐
                ▼ (If Value <= MaxThreshold)              ▼ (If Value > MaxThreshold)
   ┌─────────────────────────────┐         ┌──────────────────────────────┐
   │ Pass Modbus command to PLC  │         │ Block Write, Freeze Clock,  │
   │ & record SHA-512 log seal   │         │ Trigger EMERGENCY ROLLBACK   │
   └─────────────────────────────┘         └──────────────────────────────┘
```

### 2. Safety Invariant Mapping (Modbus / PLC Register Space)
Policies are mapped directly onto controller registers to enforce strict operating parameters:

```
# GUTS DETERMINISTIC SAFETY POLICIES - BMS & SCADA INTERLOCKS
INVARIANT_01: modbus_reg[40015] <= 4200     # Hard cap on battery cell voltage (4.20V max to prevent thermal runaway)
INVARIANT_02: modbus_reg[40016] >= 20       # Minimum cell operating temperature in Celsius
INVARIANT_03: modbus_reg[40017] <= 60       # Maximum cell operating temperature in Celsius
INVARIANT_04: write_permissions[40010] == READ_ONLY # SCADA emergency shutdown register is locked to normal operators
```

These invariants are compiled into fixed-cycle machine instructions inside `crates/vek-core/src/policy.rs`. Because the policy evaluates with cycle accuracy, no PLC write command can take effect without passing verification.
