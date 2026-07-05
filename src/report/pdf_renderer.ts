import PDFDocument from "pdfkit";
import fs from "fs";

export function generatePDF(report: any, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Primary Header
    doc.fillColor("#0284c7").fontSize(22).text("VEK Evaluation Report", { align: "center" });
    doc.fillColor("#3f3f46").fontSize(10).text("Verifiable Execution Kernel Supply-Chain & Trust Attestation", { align: "center" });
    doc.moveDown(2);

    // Metadata Block
    doc.fillColor("#0f172a").fontSize(12).text(`Report ID: ${report.report_id}`, { underline: true });
    doc.text(`Timestamp: ${report.timestamp}`);
    doc.moveDown();

    // System Identity Section
    doc.fillColor("#0284c7").fontSize(14).text("SYSTEM IDENTITY", { stroke: false });
    doc.fillColor("#0f172a").fontSize(10);
    doc.text(`Hostname: ${report.system_identity.hostname}`);
    doc.text(`OS Architecture: ${report.system_identity.os} (${report.system_identity.cpu.arch})`);
    doc.text(`Kernel Release: ${report.system_identity.kernel}`);
    doc.text(`CPU Model: ${report.system_identity.cpu.model}`);
    doc.text(`CPU Cores: ${report.system_identity.cpu.cores}`);
    doc.moveDown();

    // Performance Evidence Section
    doc.fillColor("#0284c7").fontSize(14).text("PERFORMANCE SUMMARY", { stroke: false });
    doc.fillColor("#0f172a").fontSize(10);
    doc.text(`Iterations Executed: ${report.performance_evidence.iterations.toLocaleString()}`);
    doc.text(`Mean Latency: ${report.performance_evidence.mean_ms} ms`);
    doc.text(`P95 Latency: ${report.performance_evidence.p95_ms} ms`);
    doc.text(`P99 Latency: ${report.performance_evidence.p99_ms} ms`);
    doc.moveDown();

    // Build Provenance & SLSA Trust Section
    doc.fillColor("#0284c7").fontSize(14).text("BUILD PROVENANCE & SLSA TRUST LEVEL", { stroke: false });
    doc.fillColor("#0f172a").fontSize(10);
    doc.text(`Git Commit Hash: ${report.build_provenance.git_commit}`);
    doc.text(`Dependency Lockfile Hash: ${report.build_provenance.dependency_hash}`);
    doc.text(`Build Provenance Hash: ${report.build_provenance.build_hash}`);
    doc.font("Helvetica-Bold").fillColor("#16a34a").text(`Achieved SLSA Level: Level ${report.build_provenance.slsa_level} Certified`);
    doc.font("Helvetica"); // Reset to regular
    doc.moveDown();

    // Compliance Mapping Section
    doc.fillColor("#0284c7").fontSize(14).text("REGULATORY COMPLIANCE MAPPING", { stroke: false });
    doc.fillColor("#0f172a").fontSize(10);
    
    doc.text("NIST SP 800-53 Mapping:", { underline: true });
    report.compliance_mapping.nist_800_53.forEach((item: string) => {
      doc.text(`  • ${item}`);
    });
    doc.moveDown(0.5);

    doc.text("NIST SP 800-218 Mapping:", { underline: true });
    report.compliance_mapping.nist_800_218.forEach((item: string) => {
      doc.text(`  • ${item}`);
    });
    doc.moveDown(0.5);

    doc.text(`SLSA Compliance Target: Level ${report.compliance_mapping.slsa.target_level}`);
    doc.text(`SLSA Compliance Achieved: Level ${report.compliance_mapping.slsa.achieved_level}`);
    doc.moveDown(2);

    // Verification Signature / Footer
    doc.font("Helvetica-Oblique").fillColor("#4b5563").fontSize(9).text("This document is generated programmatically by the Verifiable Execution Kernel compliance engine.", { align: "center" });
    doc.text("Verified secure by VEK Deterministic System Architecture.", { align: "center" });
    doc.font("Helvetica"); // Reset back to default regular font before ending

    doc.end();

    stream.on("finish", () => {
      resolve();
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}
