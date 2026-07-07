# VEK Ledger Format Specification (LFS-1.0)

This document specifies the schema, data types, and cryptographic chaining rules for the Verifiable Execution Kernel (VEK) Proof Ledger.

---

## 🏛️ Ledger Architecture

The VEK Proof Ledger is structured as a cryptographically chained sequence of state transition logs, representing a verifiable history of execution from the genesis block to the current logical clock.

```text
       [ Epoch Block k-1 ]
     ┌─────────────────────┐
     │ state_hash: H(k-1)  │◄───────────────────────────┐
     │ clock: k-1          │                            │
     └─────────────────────┘                            │ (backlink matching)
                ▲                                       │
                │ (prev_hash)                           │
                │                                       │
       [ Epoch Block k ]                                │
     ┌──────────────────────────────────────────────────┴┐
     │ step: k                                           │
     │ prev_hash: H(k-1)                                 │
     │ input_hash: H(Input_k)                            │
     │ state_hash: H(State_k)                            │
     │ logical_clock: k                                  │
     │ policy_result: "NOMINAL"                          │
     │ status: "RUNNING"                                 │
     └───────────────────────────────────────────────────┘
```

---

## 📐 Field Definitions

A compliant ledger record MUST contain the following fields structured as a JSON object:

### 1. `step`
* **Type**: `Integer` (unsigned 64-bit)
* **Requirement**: Mandatory.
* **Description**: A strictly monotonic, 0-indexed integer indicating the execution step. The genesis transition must be designated as `step: 0`.

### 2. `prev_hash`
* **Type**: `String` (64-character hexadecimal)
* **Requirement**: Mandatory.
* **Description**: The SHA-256 hash of the complete canonical serialized representation of the previous ledger block. For the genesis block, this MUST be filled with 64 zeros: `"0000000000000000000000000000000000000000000000000000000000000000"`.

### 3. `input_hash`
* **Type**: `String` (64-character hexadecimal)
* **Requirement**: Mandatory.
* **Description**: The SHA-256 hash of the canonical serialized representation of the transaction input parameters that triggered this state transition.

### 4. `state_hash`
* **Type**: `String` (64-character hexadecimal)
* **Requirement**: Mandatory.
* **Description**: The SHA-256 hash of the canonical serialized representation of the current state variable register values *after* applying the current transaction step.

### 5. `logical_clock`
* **Type**: `Integer` (unsigned 64-bit)
* **Requirement**: Mandatory.
* **Description**: The logical clock $\tau$, incremented with each successful state transition. This acts as a logical timestamp to prevent out-of-order transaction replays.

### 6. `policy_result`
* **Type**: `String` (Enum)
* **Requirement**: Mandatory.
* **Allowed Values**: `"NOMINAL"`, `"HALTED"`, `"WARNING"`, `"BYPASSED"`
* **Description**: The output result of the pre-commit policy evaluation rules (Axiom D6).

### 7. `status`
* **Type**: `String` (Enum)
* **Requirement**: Mandatory.
* **Allowed Values**: `"RUNNING"`, `"QUARANTINE"`, `"EMERGENCY_FREEZE"`
* **Description**: The operational status of the execution kernel during this transition cycle.

---

## 💻 Schema JSON Draft

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "VekLedgerEntry",
  "type": "object",
  "properties": {
    "step": {
      "type": "integer",
      "minimum": 0
    },
    "prev_hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    },
    "input_hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    },
    "state_hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    },
    "logical_clock": {
      "type": "integer",
      "minimum": 0
    },
    "policy_result": {
      "type": "string",
      "enum": ["NOMINAL", "HALTED", "WARNING", "BYPASSED"]
    },
    "status": {
      "type": "string",
      "enum": ["RUNNING", "QUARANTINE", "EMERGENCY_FREEZE"]
    }
  },
  "required": [
    "step",
    "prev_hash",
    "input_hash",
    "state_hash",
    "logical_clock",
    "policy_result",
    "status"
  ]
}
```
