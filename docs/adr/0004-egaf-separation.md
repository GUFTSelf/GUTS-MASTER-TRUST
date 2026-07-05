# Architectural Decision Record (ADR) 0004: EGAF Isolation (Separation of $F$ and $\Omega$)

## Status
Accepted

## Context
When executing mission-critical SCADA, industrial, or financial controls, system errors often occur because a state transition executes before safety constraints are evaluated. If an invalid state modification is allowed to contaminate system memory, recovery requires complete reboots or risks physical hardware damage.

## Alternatives Considered
1. **Post-Commit Verification**: Checking safety policies *after* committing state to main memory. This allows corrupted or unsafe states to propagate momentarily, causing catastrophic safety failures.
2. **Inline Execution Gating**: Merging safety logic directly into the transition function ($F$). This creates a highly complex, tightly coupled codebase that is extremely difficult to audit or formally verify.
3. **Execution Gated Assertion Framework - EGAF (Chosen)**: Strict runtime separation where computation $F$ produces an isolated *candidate* state, which is evaluated by verification predicate $\Omega$ in a secure enclave before being committed by stabilization $\Sigma$.

## Decision
We enforce a strict **separation of computation and policy verification (EGAF)**. Computation functions run in isolated scratchpad memory, and only after policy verification passes can states proceed to physical memory stabilization.

## Consequences
- **Positive**: Zero-state pollution. If verification fails, the candidate state is immediately discarded (atomic rollback), and the system resumes from the last verified checkpoint safely.
- **Negative**: Adds a copy-on-write memory overhead when generating candidate states.
- **Verification**: Demonstrated in `examples/constraint_demo/demo.js`, where unsafe Modbus writes are completely blocked from committing to physical PLC registers.
