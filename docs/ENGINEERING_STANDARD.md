# VEK Technical Documentation Suite
## Master Engineering Standard — Volumes I through VIII

This document organizes the complete technical documentation, governance, and audit corpus of the **Verifiable Execution Kernel (VEK)** into a structured engineering standard. This formal classification ensures seamless navigation during technical due diligence, licensing evaluations, or independent peer reviews.

---

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      VEK TECHNICAL DOCUMENTATION CORPUS                      │
├──────────────────────────────────────────────────────────────────────────────┤
│  Volume I    : Executive Overview     ──> [README.md / TECHNOLOGY_OVERVIEW]  │
│  Volume II   : Architecture           ──> [ARCHITECTURE.md / ADR-0001-0004]  │
│  Volume III  : Formal Specification   ──> [VEK_SEMANTIC_CORE / CONFORMANCE]  │
│  Volume IV   : Implementation Guide   ──> [EXAMPLES / BINDINGS / OBSERVERS]  │
│  Volume V    : Verification           ──> [EVIDENCE_DASHBOARD / RTM_MATRIX]  │
│  Volume VI   : Benchmark Evidence     ──> [BENCHMARKS.md / BENCH_REPORTS]    │
│  Volume VII  : Patent Traceability    ──> [TRACEABILITY_MATRIX / PATENTS]   │
│  Volume VIII : Commercial Licensing   ──> [LICENSE-EVALUATION / LICENSING]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Volume I: Executive Overview
*Provides a high-level conceptual introduction, scope definitions, and fundamental engineering objectives.*
1. **[`README.md`](/README.md)**: Main portal, project description, setup instructions, and repository scope.
2. **[`TECHNOLOGY_OVERVIEW.md`](/TECHNOLOGY_OVERVIEW.md)**: Conceptual introduction to verifiable execution, node quarantine, and deterministic replay loops.

---

## 📐 Volume II: Architecture
*Detailed layout of the structural layers, sandbox designs, and formal Architectural Decision Records (ADRs).*
1. **[`ARCHITECTURE.md`](/ARCHITECTURE.md)**: Full layout of core kernel layers, consensus engines, and verification gates.
2. **Architecture Decision Records (ADRs)**:
   * **[ADR 0001 — Deterministic Runtime](/docs/adr/0001-deterministic-runtime.md)**: Scaling floats to software fixed-point.
   * **[ADR 0002 — Claim Graph](/docs/adr/0002-claim-graph-traceability.md)**: Design of claim-to-code traceability database.
   * **[ADR 0003 — WAL Auditing](/docs/adr/0003-audit-bundle-wal.md)**: Cryptographic write-ahead logging specifications.
   * **[ADR 0004 — EGAF Separation](/docs/adr/0004-egaf-separation.md)**: Separation of candidate evaluation and state commitments.

---

## 🔐 Volume III: Formal Specification
*Rigorous mathematical formulations, state-transition functions, and conformance certification tiers.*
1. **[`docs/VEK_SEMANTIC_CORE_SPECIFICATION.md`](/docs/VEK_SEMANTIC_CORE_SPECIFICATION.md)**: Definitive math modeling ($\delta_e$), clock constraints, and invariants $D_1$–$D_6$.
2. **[`docs/CONFORMANCE_SPECIFICATION.md`](/docs/CONFORMANCE_SPECIFICATION.md)**: Definitions for Level 1, 2, and 3 conformance rules required of compliant runtimes.

---

## 🔌 Volume IV: Implementation Guide
*Developer handbooks, reference code modules, and live telemetry observers.*
1. **[`examples/`](/examples/)**: Suite of 5 high-fidelity reference implementations (Hello World, SCADA Interlocks, Audit WAL).
2. **[`src/components/`](/src/components/)**: Real-time TypeScript observers and SCADA animation interfaces.

---

## 🧪 Volume V: Verification
*The Requirement Traceability Matrix (RTM) and concrete evidence proving each major claim is fully met.*
1. **[`docs/EVIDENCE.md`](/docs/EVIDENCE.md)**: Consolidated Evidence Dashboard mapping claims to reproducible outputs.
2. **[`docs/RTM.md`](/docs/RTM.md)**: Comprehensive Requirements Traceability Matrix linking specifications to verification logs.
3. **[`evaluation-kit/`](/evaluation-kit/)**: Active validation scripts and independent execution report templates.

---

## 📈 Volume VI: Benchmark Evidence
*Measured throughput metrics, SLA target definitions, and scaling projections.*
1. **[`BENCHMARKS.md`](/BENCHMARKS.md)**: Performance benchmarks across AWS Nitro systems, Intel Xeon, and Apple ARM.
2. **[`evaluation-kit/benchmark_report.md`](/evaluation-kit/benchmark_report.md)**: Locally reproducible benchmark results capturing instructions per second (IPS).

---

## 📜 Volume VII: Patent Traceability
*Deep legal mapping connecting USPTO claims directly to active code files and tests.*
1. **[`evaluation-kit/traceability_matrix.md`](/evaluation-kit/traceability_matrix.md)**: Table of claims 1–45 linked to reference implementations.
2. **[`patents/`](/patents/)**: Abstract patent specifications and legal claims background.

---

## 💼 Volume VIII: Commercial Licensing
*Terms, change governance rules, and evaluator access agreements.*
1. **[`LICENSE-EVALUATION.md`](/LICENSE-EVALUATION.md)**: Legal authorization and evaluation license terms.
2. **[`docs/EGVS.md`](/docs/EGVS.md)**: Engineering Governance & Verification Specification detailing class changes and release gates.

---

*Certified by GUTS DETERMINISTIC LLC / Technical Governance Board.*
