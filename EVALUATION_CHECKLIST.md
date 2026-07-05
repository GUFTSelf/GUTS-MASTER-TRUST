# VEK Technical Evaluation Checklist

This checklist is designed for first-time evaluators, security auditors, or potential licensing partners. Use this document to guide your team through verifying the deterministic state transition claims, schema conformance, and patent traceability of the Verifiable Execution Kernel (VEK).

---

## 🏁 Phase 1: Environment Setup

- [ ] **Clone Repository & Open Workspace**
  - Ensure you have access to the complete VEK workspace files.
- [ ] **Check Node.js Installation**
  - Run `node -v` to ensure you are on Node.js v18 or higher.
- [ ] **Install Reference Dependencies**
  - Run the following in your terminal to populate dependencies:
    ```bash
    npm install
    ```

---

## 🧪 Phase 2: Reproducing Reference Implementations

- [ ] **Run the Automated Conformance & Verification Runner**
  - Run the standardized evaluation bash script:
    ```bash
    npm run verify
    ```
- [ ] **Verify Deterministic VM Stepping Output (Hello World)**
  - Confirm that a valid SHA-512 state root hash is generated at the end of execution.
- [ ] **Verify Consensus Drift Isolation (Replay Demo)**
  - Confirm that `Node_C_Apple_M3` is successfully identified as divergent, isolated/quarantined, and rolled back at Cycle 4,822.
- [ ] **Verify SCADA Interlock Safety Gating (Constraint Demo)**
  - Confirm that trying to write `4500` to Modbus register `40015` triggers an `INVARIANT_01` safety violation and successfully locks the simulated enclave.
- [ ] **Verify Cryptographically Signed Audit Ledgers (Audit Bundle)**
  - Confirm that a complete JSON payload conforming to `/schemas/audit_bundle_v1.json` is printed, including public keys and an attached signature envelope.
- [ ] **Verify Patent Claim Mapping (Claim Graph)**
  - Confirm that USPTO claim identifiers are programmatically verified against mapped codebase files.

---

## 📋 Phase 3: Auditing Architecture & Documentation

- [ ] **Review Architectural Decision Records (ADRs)**
  - Read through our design justifications:
    - 📘 `docs/adr/0001-deterministic-runtime.md` (Fixed-point float strategies)
    - 📘 `docs/adr/0002-claim-graph-traceability.md` (Legal mapping matrix)
    - 📘 `docs/adr/0003-audit-bundle-wal.md` (Transaction log WAL)
    - 📘 `docs/adr/0004-egaf-separation.md` (Pre-commit computation separation)
- [ ] **Review Conformance Criteria**
  - Read `docs/CONFORMANCE_SPECIFICATION.md` to evaluate Level 1, 2, and 3 validation criteria.
- [ ] **Review Engineering Governance Specification**
  - Read `docs/EGVS.md` to check risk classification thresholds and lifecycle exit parameters.
- [ ] **Review Patent Specification Summary**
  - Read `patents/VEX_patent_specification_summary.md` to map legal claims directly to their implementation targets.

---

## 🗳️ Checklist Status Confirmation

Upon successful completion of all steps above:

> "The execution, consensus, safety, and audit boundaries of the Verifiable Execution Kernel are verified as behaving exactly as specified in the reference documentation."

* **Date Verified**: _____________________
* **Lead Technical Auditor**: _____________________
* **Reviewing Organization**: _____________________
