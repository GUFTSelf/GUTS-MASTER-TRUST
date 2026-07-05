# Architectural Decision Record (ADR) 0002: Claim Graph Traceability Matrix

## Status
Accepted

## Context
When conducting technology assessments for licensing or regulatory audits, it is historically difficult to prove that a physical software implementation actually executes the exact steps claimed in USPTO patent documents or regulatory policies. This creates a critical "traceability gap" between legal ownership and executable source code.

## Alternatives Considered
1. **Manual Spreadsheet Audits**: High operational overhead, prone to human error, and becomes stale as soon as code changes are committed.
2. **Static Code Comments**: Embedding patent numbers in code comments lacks formal syntax validation and cannot be checked programmatically.
3. **Dynamic Claim Graph & CIM (Chosen)**: A structured JSON claim graph schema mapping physical files, functions, and unit test suites directly to claim clauses, verified on every build.

## Decision
We implement a formal **Claim-to-Implementation Matrix (CIM)** that exposes programmatic mappings between patent claim identifiers and physical source modules. We bundle this data directly into `/schemas/claim_graph_v1.json` to enable automated verification testing.

## Consequences
- **Positive**: Evaluators can instantly trace code statements to legal patent claims. Tests verify that execution paths conform to patented behaviors on every commit.
- **Negative**: Requires engineers to maintain mappings in JSON schemas when refactoring physical source file trees.
- **Verification**: Demonstrated in `examples/claim_graph_demo/demo.js`, where a USPTO claim is programmatically resolved to physical C++ mock-ups and verified via test execution.
