# LICENSE-EVALUATION.md

## Technology Evaluation & Non-Disclosure Agreement (NDA)

**Licensor:** GUTS DETERMINISTIC TECHNOLOGY LLC  
**IP Holder:** GUTS MASTER TRUST  
**Revision Date:** July 4, 2026  
**Document Ref:** VEK-EVAL-v2.4.0

---

### 1. Purpose of Evaluation
This repository, including the Verifiable Execution Kernel (VEK) source files, specifications, simulation scripts, and visual console applet, is provided strictly to designated evaluators for assessing GUTS MASTER TRUST's technology, code quality, performance benchmarks, and patent claims.

Any commercial distribution, production deployment, secondary copying, decompilation, or unauthorized disclosure of this proprietary codebase is strictly prohibited unless authorized under a separate **Field-of-Use Licensing Agreement**.

---

### 2. Permitted Uses & Scope
Under this Evaluation License, the Evaluator is granted a temporary, non-exclusive, non-transferable, revocable right to:
1. **Clone & Compile**: Download, compile, and run the VEK Console in an isolated staging/local environment for verification purposes.
2. **Execute Assertions**: Trigger automated Cargo tests and simulation playgrounds inside the Console to audit claim boundaries.
3. **Reproduce Benchmarks**: Run local clock accuracy, floating-point reconciliation, and zero-knowledge witness latency tests.

**PROHIBITED ACTIONS**:
* Reverse-engineering or extracting cryptographic keys.
* Disclosing benchmarks or security reports to third parties without prior written consent from Thoeun Thien (CEO).
* Committing proprietary source snippets to public repositories or AI model training sets.

---

### 3. Verification & Compliance Auditing
GUTS DETERMINISTIC TECHNOLOGY LLC reserves the right to request proof of compliance with the evaluation conditions. All code execution logs, write-ahead logs, and signed attestation quotes generated during evaluation remain the joint property of GUTS MASTER TRUST and GUTS DETERMINISTIC TECHNOLOGY LLC.

---

### 4. Step-by-Step Evaluation Routine
To verify the physical implementations of our patented claims, follow the standard reproducibility routine below:

#### Step A: System Prerequisites
* Node.js v18+ or later
* Rust toolchain (stable compiler `rustc`/`cargo`)
* Git (version 2.30+)

#### Step B: Installation & Dev Server Boot
1. Clone this repository locally.
2. Install base visual applet dependencies:
   ```bash
   npm install
   ```
3. Initialize environmental overrides:
   ```bash
   cp .env.example .env.local
   # Provide your standard evaluation key parameters
   ```
4. Launch the local development console:
   ```bash
   npm run dev
   ```
5. Open your local browser to `http://localhost:3000` to interact with the VEK Console interface.

#### Step C: Executing Unit Test Verification
To verify code-level embodiments against USPTO claims:
1. In the VEK Console, navigate to the **Licensing** tab.
2. Ensure you are on the **Claim-to-Implementation Matrix (CIM)** sub-tab.
3. Select any desired Claim (e.g., *19/541,415 - Claim 1* or *19/679,674 - Claim 2*).
4. Review the supporting source files and associated implementation snippets.
5. Click **Verify Claim** to trigger the simulated Cargo test suite.

---

### 5. Inquiries & Official Submissions
If your compliance, security, or legal team requires a customized Evaluation Agreement with strict air-gapped guarantees, please contact the licensing office directly.

* **Contact Person:** Thoeun Thien, Founder & CEO
* **Email:** [thoeunceo@gdtsi.com](mailto:thoeunceo@gdtsi.com)
* **Direct Office Phone:** +1 (727) 555-0199 *(Enterprise Licensing Hotline)*
* **Mailing Address:** Clearwater, Florida
