# VEK Tagged Releases & Engineering Validation Packages (EVP)
## Versioned Evaluation Index — GUTS DETERMINISTIC TECHNOLOGY LLC

This directory contains the definitive, cryptographically-hashed, and version-controlled release packages of the **Verifiable Execution Kernel (VEK)**. Each release represents a critical milestone in our technology maturation path, complete with independent evaluation resources, software bills of materials (SBOM), and performance benchmarks.

---

## 📈 Release Matrix & Progression

| Version | Release Name | Release Date | Major Focus | Verification Level | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`v1.0.0`** | **Licensing Release** | **2026-07-05** | Production readiness, RTM traceability, Evidence dashboard. | **Level 3 Conformance Verified** | **🟢 Active** |
| **`v0.9.0`** | **External Review Candidate** | 2026-06-25 | Engineering governance, change criteria, SCADA interlocks. | Level 2 Conformance Verified | 🟡 Archive |
| **`v0.8.0`** | **Evaluation Kit** | 2026-06-12 | Executable scripts, mock datasets, automated audit log output. | Level 2 Conformance Verified | 🟡 Archive |
| **`v0.7.0`** | **Reference Implementations** | 2026-05-28 | Simulated 32-register virtual CPU, arithmetic scaling layers. | Level 1 Conformance Verified | 🟡 Archive |
| **`v0.6.0`** | **Formal Specification** | 2026-05-10 | Core state-transition function, invariants $D_1$–$D_6$ modeling. | Spec Approved | 🟡 Archive |
| **`v0.5.0`** | **Initial Evaluation Platform** | 2026-04-18 | Initial application scaffolding, basic visualizer console. | Concept Approved | 🟡 Archive |

---

## 🔒 Security & Release Integrity

Each package is verified against official SHA-256 integrity checksums to ensure zero modifications:

* **Active Release Directory**: [`/releases/v1.0.0/`](/releases/v1.0.0/)
* **Integrity Ledger**: `/releases/v1.0.0/checksums.sha256`
* **Active SBOM Mapping**: `/releases/v1.0.0/sbom.json`

---

## 🏃 Evaluator Access Instructions

To download, compile, and run the verified `v1.0.0` Licensing Release package, execute:

```bash
# 1. Access active workspace release tag
git checkout v1.0.0

# 2. Extract verified bundle
tar -xzf vek-v1.0.0.tar.gz

# 3. Compile and verify integrity
sha256sum -c releases/v1.0.0/checksums.sha256
```

*Managed by the VEK Release Management Group.*
