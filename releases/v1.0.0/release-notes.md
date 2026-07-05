# VEK Release Notes — v1.0.0 (Licensing Release)
## Released: July 5, 2026 — GUTS DETERMINISTIC TECHNOLOGY LLC

Version **`1.0.0`** represents the formal culmination of the Verifiable Execution Kernel (VEK) specification into a production-ready **Engineering Validation Package (EVP)**. This release transitions the codebase from a behavioral prototype to an independently auditable computing substrate, complete with empirical evidence dashboards and a direct Requirements Traceability Matrix.

---

## 🚀 Key Deliverables & Features

### 1. Unified Mathematical State Core
* Formally defined the exact state tuple $S_t = \langle R_t, M_t, \tau_t, \Pi_t, K_t \rangle$ and the canonical state transition function $\delta_e(S, I)$ inside `docs/VEK_SEMANTIC_CORE_SPECIFICATION.md`.
* Embedded safety policy invariants $D_1$ through $D_6$ directly into compile-time assertion guards.

### 2. Empirical Evidence Dashboard & RTM
* Added `docs/EVIDENCE.md` to serve as a single, machine-backed point of contact proving every engineering claim with code.
* Built `docs/RTM.md` to link client specifications directly to test cases and JSON schema outputs.

### 3. Reproducible Host Benchmark Harness
* Introduced `/examples/run_benchmarks.js` enabling technical reviewers to verify VM throughput and constraint latency overhead in real-time on any host system.

### 4. Zero-Drift Float Isolation & Quarantine
* Full implementation of the multi-node consensus voting system in `/examples/replay_demo/demo.js`, capable of isolating sub-millisecond float drifts and triggering automatic rollback.

---

## 🔒 Security & Attestation Compliance

* **FIPS Cryptographic Integrity**: Utilizes SHA-512 for cryptographic ledger chain accumulators and Ed25519 signatures for transaction boundaries.
* **Isolation Attestation**: Hardened boundary gates intercept and quarantine untrusted system library mutations.
* **Schema Validation**: 100% compliant with `/schemas/protocol_v1.json` and `/schemas/audit_bundle_v1.json`.

---

## 📦 File Integrity Metrics

* **Source Tarball**: `vek-v1.0.0.tar.gz`
* **SHA-256 Signature**: `d48a27ef83cb84a1e948c3b7a5e01a4e12e947e62a129ef8be4821a7df8cb23e`
* **Software Bill of Materials (SBOM)**: Available in `/releases/v1.0.0/sbom.json`

*Approved by Thoeun Thien, CEO.*
