# VEK Empirical Benchmark Report
## Generated on Host: linux (x64)
* **Timestamp**: 2026-07-05T14:25:20.065Z
* **Node.js**: v22.23.0

---

## 📈 1. VM Instruction Throughput
* **Instructions Executed**: 1,000,000 ALU operations
* **Total Duration**: 7.96 ms
* **Calculated Speed**: **125,683,972 IPS (Instructions Per Second)**

---

## 📊 2. Stream Constraint Evaluation Overhead
The following measurements outline the latency scaling profile of our Execution-Gated Assertion Framework (EGAF) at varying packet counts:

| Token Block Size | Execution Time (ms) | Average Overhead Per Token (ms) |
| :--- | :--- | :--- |
| **100** | 0.1927 ms | 0.001927 ms |
| **1000** | 0.0303 ms | 0.00003 ms |
| **10000** | 0.5133 ms | 0.000051 ms |
| **50000** | 1.629 ms | 0.000033 ms |

---

## 🧬 3. Multi-Node Drift Reconciliation Latency
* **Simulated Nodes**: 3 nodes (2 matching consensus, 1 outlier float-drift)
* **Reconciliation Time**: **0.09581 ms**
* **Result**: Outlier quarantined, state rollbacked, and majority agreement threshold met.

---

*Verified by the VEK Automated Evaluation Harness.*
