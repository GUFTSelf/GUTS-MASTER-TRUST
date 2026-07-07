# VEK Engine Certification Procedures

This document outlines the official compliance certification workflows required to validate third-party Verifiable Execution Kernel (VEK) engine implementations.

---

## 🏛️ Certification Philosophy

VEK certification is a zero-trust, automated process. Independent developers can self-certify their engines by running their compliance test suites against the standardized test vectors in `/conformance/vectors` and comparing outcomes to `/conformance/expected/`.

```text
  [ Developer Engine ] ──(Consumes Vectors)──► [ Executes 10 CTS Tasks ] ──► [ Diff Results ]
                                                                                   │
  [ Verified Stamp ] ◄─────── (PASS: matching hashes & outputs) ───────────────────┘
```

---

## 🏃 STEP 1: Setting Up the Testbed

To certify an engine, you must setup the test vectors.
1. Download the active test vectors from the `/conformance/vectors/` directory.
2. Initialize your candidate engine with the configurations specified in `/conformance/spec-version.json`.
3. Set your internal PRNG to use the seeds provided inside each vector's JSON configuration.

---

## 🔄 STEP 2: Executing Test Sequences

Your engine must run each sequence exactly as defined:

### 1. The Sequence Loop
* Feed each transition instruction sequentially.
* For each instruction, invoke `Execute()` followed by `Commit()`.
* Log the logical clock $\tau$, computed post-state hash, and output registers.

### 2. The Verification Check
Compare your computed state hashes with the reference signatures in `/conformance/expected/hashes.json`.
* **State Transition 001 Final Hash**:
  `5fa1f97371c1b12b509bc0a31289feef52da89bb28a0129bcba801a932b8efd1`
* **State Transition 002 Final Hash**:
  `40c5171daa9a0007e15fa12bc320ea9b11fba82b99aa39eef0120ab2e912bc88`

---

## 📝 STEP 3: Submitting Findings

Once the test run completes:
1. Export the final ledger using `ExportLedger()`.
2. Generate a JSON summary outlining pass/fail statuses for all 10 CTS categories.
3. Submit the compliance report alongside your open-source repository for official review.
