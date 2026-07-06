import { formatHashToFit, parseMetadataFields, MASTER_AUDIT_RECEIPT } from "./pdfGenerator";

export interface TestCaseResult {
  name: string;
  category: "Formatting" | "Parsing" | "Integrity";
  status: "PASS" | "FAIL";
  message: string;
}

export function runPdfGeneratorTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // 1. Test Hash Formatting (Preventing truncation)
  try {
    const longHash = "c4d8e7f9a2b1c0d3e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8"; // 64 chars
    const formatted = formatHashToFit(longHash, 32);
    
    // Check that it's split with a newline and matches the original characters
    const expectedWrapped = "c4d8e7f9a2b1c0d3e5f6g7h8i9j0k1l2\nm3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8";
    
    if (formatted === expectedWrapped) {
      results.push({
        name: "Hash Wrap Formatter Split",
        category: "Formatting",
        status: "PASS",
        message: "Successfully wrapped 64-char hash into two 32-char lines separated by a newline."
      });
    } else {
      results.push({
        name: "Hash Wrap Formatter Split",
        category: "Formatting",
        status: "FAIL",
        message: `Expected wrapped hash to match exactly, but got: "${formatted}"`
      });
    }
  } catch (err: any) {
    results.push({
      name: "Hash Wrap Formatter Split",
      category: "Formatting",
      status: "FAIL",
      message: `Crashed: ${err.message}`
    });
  }

  // 2. Test Metadata Parser - Framework Controls Extraction
  try {
    const mockMetadata = {
      generator_version: "1.0.0",
      timestamp: "2026-07-05T17:15:17.433Z",
      environment: {
        platform: "linux",
        arch: "x64",
        node_version: "v22.23.0",
        lockfile_sha256: "355f862fc"
      },
      compliance_frameworks: {
        NIST_SP_800_53_REV5: {
          controls_aligned: [
            {
              control: "AU-2",
              name: "Audit Event Generation",
              status: "COMPLIANT",
              evidence: "Deterministic trace logs."
            }
          ]
        },
        NIST_SP_800_218_SSDF: {
          tasks_aligned: [
            {
              task: "PW-1.1",
              name: "Verify Component Integrity",
              status: "COMPLIANT",
              evidence: "Dependency hash locking."
            }
          ]
        }
      },
      provenance_signature: "sig-123"
    };

    const parsed = parseMetadataFields(mockMetadata);

    if (parsed.frameworks.length === 2) {
      const hasAU2 = parsed.frameworks.some(f => f.control === "AU-2" && f.framework === "NIST SP 800-53 Rev 5");
      const hasPW1 = parsed.frameworks.some(f => f.control === "PW-1.1" && f.framework === "NIST SP 800-218 SSDF");

      if (hasAU2 && hasPW1) {
        results.push({
          name: "Metadata Parsing Framework Compliance Extraction",
          category: "Parsing",
          status: "PASS",
          message: "Correctly extracted multiple compliant frameworks, controls, and evidence notes from JSON."
        });
      } else {
        results.push({
          name: "Metadata Parsing Framework Compliance Extraction",
          category: "Parsing",
          status: "FAIL",
          message: "Extracted elements, but specific AU-2 or PW-1.1 controls were mismapped."
        });
      }
    } else {
      results.push({
        name: "Metadata Parsing Framework Compliance Extraction",
        category: "Parsing",
        status: "FAIL",
        message: `Expected exactly 2 framework controls, but extracted: ${parsed.frameworks.length}`
      });
    }

    if (parsed.provenance === "sig-123" && parsed.env.platform === "linux") {
      results.push({
        name: "Metadata Parsing Environment & Signature Extraction",
        category: "Parsing",
        status: "PASS",
        message: "Successfully extracted provenance signature and target system platform identifier."
      });
    } else {
      results.push({
        name: "Metadata Parsing Environment & Signature Extraction",
        category: "Parsing",
        status: "FAIL",
        message: `Mismatched signature or environment details.`
      });
    }

  } catch (err: any) {
    results.push({
      name: "Metadata Parser Integrity",
      category: "Parsing",
      status: "FAIL",
      message: `Parser crashed during token traversal: ${err.message}`
    });
  }

  // 3. Test Master Receipt Invariant Checks
  try {
    const isIdValid = MASTER_AUDIT_RECEIPT.receipt_id.startsWith("GUTS-MASTER-TRUST");
    const isHashLengthValid = MASTER_AUDIT_RECEIPT.master_root_hash.length === 64;
    
    if (isIdValid && isHashLengthValid) {
      results.push({
        name: "Master Audit Receipt Schema Verification",
        category: "Integrity",
        status: "PASS",
        message: "MASTER_AUDIT_RECEIPT constants correctly adhere to the 64-character root hash constraint and structural namespace rules."
      });
    } else {
      results.push({
        name: "Master Audit Receipt Schema Verification",
        category: "Integrity",
        status: "FAIL",
        message: "MASTER_AUDIT_RECEIPT invariants violated. Check length/prefix requirements."
      });
    }
  } catch (err: any) {
    results.push({
      name: "Master Audit Receipt Schema Verification",
      category: "Integrity",
      status: "FAIL",
      message: `Validation script failed: ${err.message}`
    });
  }

  return results;
}
