# GUTS MASTER TRUST Technology Evaluation Dossier
## Master Index & Document Mapping (Docs 1–26)

This document contains the structural blueprint and metadata mapping for the twenty-six (26) formal technical, legal, and operational documents comprising the **VEK Technology Evaluation Package**. This index is designed to facilitate standard due diligence, compliance audits, and field-of-use licensing evaluations by prospective corporate partners, legal counsel, and government acquisition officers (DoD).

---

## 📂 The 26-Document Dossier Map

The table below catalogs every document in the package, its primary classification, and its location or implementation file in this evaluation repository.

| Doc ID | Document Title & Scope | Classification | Verification / Repository Reference |
| :--- | :--- | :--- | :--- |
| **Doc 1** | Executive Summary & Technology Highlights | Executive | `README.md` & `/licensing/Enterprise_Pitch_Bundle.md` |
| **Doc 2** | Intellectual Property & Patent Portfolio Overview | Legal | `/patents/portfolio.md` |
| **Doc 3** | Verifiable Execution Kernel (VEK) Specification | Engineering | `/TECHNOLOGY_OVERVIEW.md` & `/crates/vek-core/src/vm.rs` |
| **Doc 4** | Write-Ahead Log (WAL) Cryptographic Design | Security | `/SECURITY.md` & `/crates/vek-storage/src/wal.rs` |
| **Doc 5** | Real-Time Invariant Enforcement & Policy Engine | Engineering | `/crates/vek-core/src/policy.rs` |
| **Doc 6** | Multi-Node Replay-Verification & Consensus Protocol | Engineering | `/ARCHITECTURE.md` & `services/replay-service/` |
| **Doc 7** | Sovereign Isolation Boundary & Container Sandbox Specs | Security | `/SECURITY.md` & `services/execution-service/` |
| **Doc 8** | **[RECONSTRUCTED]** Floating-Point Drift Mitigation | Engineering | `/licensing/Docs_8_11_Reconstruction.md` (Section 1) |
| **Doc 9** | **[RECONSTRUCTED]** Secure Enclave (TEE) Onboarding | Engineering | `/licensing/Docs_8_11_Reconstruction.md` (Section 2) |
| **Doc 10**| **[RECONSTRUCTED]** Ed25519 PCR Lifecycle & Revocation | Security | `/licensing/Docs_8_11_Reconstruction.md` (Section 3) |
| **Doc 11**| **[RECONSTRUCTED]** SCADA Policy Map & PLC Integration | Industrial | `/licensing/Docs_8_11_Reconstruction.md` (Section 4) |
| **Doc 12**| Performance Benchmarking Protocol & Metric Logs | Validation | `BENCHMARKS.md` |
| **Doc 13**| Claim-to-Implementation Traceability Matrix (CIM) | Legal | `/patents/claim_traceability.md` & `/src/components/CimMatrix.tsx` |
| **Doc 14**| Technology Evaluation & Non-Disclosure Agreement (NDA) | Legal | `LICENSE-EVALUATION.md` & `/licensing/NDA.md` |
| **Doc 15**| Field-of-Use Commercial Licensing Fee Schedule | Commercial | `/licensing/Enterprise_Pitch_Bundle.md` (Section 3) |
| **Doc 16**| Government/DoD Procurement & CAGE Compliance | Regulatory | `/licensing/Contact.md` |
| **Doc 17**| Multi-Threaded Replay Accuracy Verification Logs | Validation | `BENCHMARKS.md` & `services/replay-service/src/reconciler.rs` |
| **Doc 18**| Threat Vector Mitigations & Vulnerability Policy | Security | `SECURITY.md` |
| **Doc 19**| TypeScript SDK Integration Manual | Developer | `/src/types.ts` & Administrative Console API |
| **Doc 20**| CI/CD Pipeline Automation & Build Setup | DevOps | `/package.json` & Dev Server Configs |
| **Doc 21**| Enterprise Devpost Response & Hackathon Case | Case Study | `/licensing/Devpost_Response.md` |
| **Doc 22**| Pitch Deck & Business Presentation Abstract | Commercial | `/licensing/Enterprise_Pitch_Bundle.md` |
| **Doc 23**| Legal Opinion on Patent Defensibility & Novelty | Legal | `/patents/application_mapping.md` |
| **Doc 24**| UEI, CAGE, and ORCID Compliance Declaration | Regulatory | `src/components/Contact.tsx` |
| **Doc 25**| BMS & Thermodynamic State-Transition Invariants | Energy Systems | `/patents/portfolio.md` (Family 7) |
| **Doc 26**| Photonic Molecular Processing & Research Agenda | Experimental | `/patents/portfolio.md` (Family 8) |

---

## 📅 Multi-Phase Engineering Roadmap

To transition this technology assessment platform into production, the evaluation package contains a detailed **24-Week Engineering Roadmap** mapping milestones, deliverables, and Version 1.0 exit criteria across seven key phases.

* **Reference Document**: 📅 **[/licensing/Development_Roadmap.md](/licensing/Development_Roadmap.md)**

---

## 🛠️ Verification and Due Diligence Protocol

Counsel and evaluators are instructed to perform their verification in accordance with **Doc 14 (Standard Non-Disclosure Agreement)** and **Doc 13 (CIM)**. 

Interactive validation can be triggered on-demand via the **VEK Console administrative UI**:
1. **Console Launch**: Follow the prerequisites in `LICENSE-EVALUATION.md`.
2. **CIM Execution**: Select the desired USPTO application mapping (e.g., *19/541,415* or *19/679,674*) to run simulated unit tests locally.
3. **Consensus Audits**: Monitor floating-point drift and enclave boundary enforcement via the interactive dashboard modules.
