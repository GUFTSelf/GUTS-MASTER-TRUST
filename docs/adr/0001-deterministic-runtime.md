# Architectural Decision Record (ADR) 0001: Deterministic Runtime Representation

## Status
Accepted

## Context
In distributed computing, executing the same program across heterogeneous CPU architectures (e.g., Intel Xeon, AMD EPYC, Apple M3) can result in divergent floating-point calculations due to differences in FPU instructions, rounding modes, and IEEE 754 precision modes. This nondeterminism breaks consensus state hashes, making execution logs impossible to replay or formally verify across enclaves.

## Alternatives Considered
1. **IEEE 754 Software Emulation Library**: Emulating all 32-bit and 64-bit float math in software is extremely slow, introducing a 50x-100x latency overhead.
2. **Strict Hardware-Bound Execution**: Forcing all nodes to use identical CPUs (e.g., AMD EPYC only) limits platform deployment and cloud hardware flexibility.
3. **Fixed-Point / Integer-Scaled Arithmetic (Chosen)**: All state-transition variables, SCADA metrics, and sensor values are represented as scaled integers (fixed-point math), eliminating hardware-specific floating-point arithmetic.

## Decision
We select **Integer-Scaled Fixed-Point Arithmetic** as the primary runtime representation for the Verifiable Execution Kernel. Any decimal values are scaled at input-boundaries to pre-determined integer sizes (e.g., $10^6$ scale factors) before entering the transition function ($F$).

## Consequences
- **Positive**: Complete hardware-independent arithmetic determinism. Identical input states always produce bit-for-bit identical state hashes.
- **Negative**: Minor translation complexity at boundary ingestion interfaces (scaling and de-scaling values).
- **Verification**: Demonstrated in `examples/replay_demo/demo.js`, where floating-point drift on non-conforming nodes is actively isolated and reconciled.
