# Architectural Decision Record (ADR) 0003: Append-Only Write-Ahead Log (WAL) Audit Bundles

## Status
Accepted

## Context
A key requirement of the Verifiable Execution Kernel (VEK) is producing forensic-grade audit logs that allow third parties to completely reconstruct execution history. This requires a tamper-evident storage format that binds state-transition traces to cryptographic signatures.

## Alternatives Considered
1. **Relational Database Logs**: Storing logs in standard relational tables (e.g., PostgreSQL) lacks tamper-evidence; root administrators can rewrite database rows.
2. **Distributed Blockchain Consensus**: Eliminates the database trust issue but introduces massive networking, tokenomics, and block-generation latency constraints.
3. **Cryptographically Chained WAL Bundles (Chosen)**: A lightweight, local Write-Ahead Log (WAL) format where each transaction block contains a hash of the previous block, signed with public-key cryptography (Ed25519) and structured to a strict JSON schema.

## Decision
We select **Cryptographically Chained WAL Bundles** as the platform's core persistence model. Transactions are saved as signed blocks conforming strictly to the `/schemas/audit_bundle_v1.json` schema.

## Consequences
- **Positive**: Lightweight, decentralized, high-performance, and verifiable. Any altered block breaks the hash-chain validation, exposing tempering instantly.
- **Negative**: Requires secure storage of private signing keys inside enclaves.
- **Verification**: Demonstrated in `examples/audit_bundle_demo/demo.js`, which formats and signs WAL blocks under strict validation.
