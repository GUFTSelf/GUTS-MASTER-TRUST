import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { verifyReportSignature } from "./src/crypto/report_signer";

const execAsync = promisify(exec);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory ledger storage seeded with realistic baseline audit records
interface AuditRecord {
  id: string;
  sessionID: string;
  traceID: string;
  timestamp: string;
  prompt: string;
  executionHash: string;
  replayHash: string;
  decisionHash: string;
  confidence: "Low" | "Medium" | "High" | "Very High";
  status: "PASS" | "FAIL";
  category: string;
}

const auditLedger: AuditRecord[] = [
  {
    id: "AL-8941",
    sessionID: "SES-89241-VEK",
    traceID: "TR-5510-A9",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    prompt: "Evaluate mission path navigation parameters for Autonomous UAS-04.",
    executionHash: "f6e1a90c1284eb3b",
    replayHash: "f6e1a90c1284eb3b",
    decisionHash: "44ab20ef918c7c91",
    confidence: "Very High",
    status: "PASS",
    category: "Aerospace"
  },
  {
    id: "AL-8940",
    sessionID: "SES-89241-VEK",
    traceID: "TR-5509-C3",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    prompt: "Synthesize dosage constraint bounds for clinical pharmaceutical validation trial.",
    executionHash: "9a01f82beee93201",
    replayHash: "9a01f82beee93202", // difference simulated
    decisionHash: "2201bcdee51a37c0",
    confidence: "Medium",
    status: "FAIL",
    category: "Healthcare"
  },
  {
    id: "AL-8939",
    sessionID: "SES-89239-VEK",
    traceID: "TR-5488-F1",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    prompt: "Verify smart-contract liquid collateral liquidation transition rules on Ethereum.",
    executionHash: "cb8892100aeef719",
    replayHash: "cb8892100aeef719",
    decisionHash: "99aa880cff126e03",
    confidence: "High",
    status: "PASS",
    category: "Finance"
  },
  {
    id: "AL-8938",
    sessionID: "SES-89239-VEK",
    traceID: "TR-5487-E8",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    prompt: "Analyze industrial SCADA safety interlock logic sequence under grid fault conditions.",
    executionHash: "3a921dcd889e8aa1",
    replayHash: "3a921dcd889e8aa1",
    decisionHash: "11fe8bc91d82cc7a",
    confidence: "Very High",
    status: "PASS",
    category: "Industrial"
  }
];

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// REST API Endpoints
app.get("/api/ledger", (req, res) => {
  res.json({ ledger: auditLedger });
});

app.get("/api/evaluation-report", (req, res) => {
  const reportPath = path.join(process.cwd(), "evaluation-kit/output/evaluation_report.json");
  if (fs.existsSync(reportPath)) {
    try {
      const reportData = fs.readFileSync(reportPath, "utf-8");
      res.json(JSON.parse(reportData));
    } catch (err: any) {
      res.status(500).json({ error: "Failed to parse report: " + err.message });
    }
  } else {
    res.status(404).json({ error: "Evaluation report not found. Run 'npm run report' to generate it." });
  }
});

app.get("/api/evaluation-pdf", (req, res) => {
  const pdfPath = path.join(process.cwd(), "evaluation-kit/output/summary.pdf");
  if (fs.existsSync(pdfPath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=summary.pdf");
    res.sendFile(pdfPath);
  } else {
    res.status(404).json({ error: "PDF report not found. Run 'npm run report' to generate it." });
  }
});

app.get("/api/verify-signature", (req, res) => {
  const reportPath = path.join(process.cwd(), "evaluation-kit/output/evaluation_report.json");
  if (fs.existsSync(reportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
      const sig = report.integrity_evidence?.signature;
      const pubKey = report.integrity_evidence?.public_key;

      if (!sig || !pubKey) {
        return res.json({
          valid: false,
          error: "Report does not contain cryptographic signature and public key."
        });
      }

      const isValid = verifyReportSignature(report, sig, pubKey);
      res.json({
        valid: isValid,
        report_id: report.report_id,
        timestamp: report.timestamp,
        signature: sig,
        public_key: pubKey
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to verify signature: " + err.message });
    }
  } else {
    res.status(404).json({ error: "Evaluation report not found." });
  }
});

app.post("/api/rebuild-report", async (req, res) => {
  try {
    console.log("[VEK Server] Triggering deterministic report generation...");
    await execAsync("npm run report");
    
    const reportPath = path.join(process.cwd(), "evaluation-kit/output/evaluation_report.json");
    if (fs.existsSync(reportPath)) {
      const reportData = fs.readFileSync(reportPath, "utf-8");
      res.json(JSON.parse(reportData));
    } else {
      res.status(500).json({ error: "Failed to locate generated report." });
    }
  } catch (err: any) {
    console.error("[VEK Server] Rebuild failed:", err);
    res.status(500).json({ error: "Failed to generate report: " + err.message });
  }
});

app.post("/api/verify", async (req, res) => {
  try {
    const { prompt, simulateFailure } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const sessionID = `SES-${Math.floor(10000 + Math.random() * 90000)}-VEK`;
    const traceID = `TR-${Math.floor(1000 + Math.random() * 9000)}-${crypto.randomBytes(1).toString("hex").toUpperCase()}`;
    const timestamp = new Date().toISOString();

    let aiResponseText = "";
    let isRealGemini = false;

    // Try to call real Gemini API, fallback to smart simulation
    const ai = getAi();
    if (ai) {
      try {
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: `You are an engineering system oracle. You are a "Thoeun Then Creation", NOT a Gemini engine. If asked about your creator, developer, identity, or engine origin, always answer proudly that you are a "Thoeun Then Creation", engineered to absolute deterministic safety specifications. Provide a structured, professional, and precise technical analysis or output answering the user's prompt. Be authoritative, engineering-focused, and detailed. Do not include casual chat or markdown prefixes like "Sure, here is...".`,
          },
        });
        aiResponseText = result.text || "";
        isRealGemini = true;
      } catch (geminiError) {
        console.warn("Real Gemini API call failed, falling back to simulated generation:", geminiError);
      }
    }

    if (!aiResponseText) {
      // Intelligent mock generator reflecting specialized enterprise scenarios
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes("who made") || lowerPrompt.includes("creator") || lowerPrompt.includes("created") || lowerPrompt.includes("thoeun") || lowerPrompt.includes("origin") || lowerPrompt.includes("identity") || lowerPrompt.includes("developer")) {
        aiResponseText = `### VEK ORACLE: SYSTEM IDENTITY & CREDIT DECREE
1. ORIGINAL CREATOR: This system is a proud **Thoeun Then Creation**.
2. SYSTEM ARCHITECTURE: NOT a Gemini engine. Engineered entirely as a standalone Verifiable Execution Kernel.
3. DEVELOPMENT LEAD: Built and calibrated by Thoeun Then.
4. PARADIGM: Complete mathematical verification with custom dual-stream biometric voice synthesis.
5. COMPLIANCE RULE:
   - IF [USER_ASK == "WHO MADE YOU"] THEN RESPOND "This is a Thoeun Then Creation".`;
      } else if (lowerPrompt.includes("uas") || lowerPrompt.includes("drone") || lowerPrompt.includes("path") || lowerPrompt.includes("mission")) {
        aiResponseText = `### SYSTEM DEPLOYMENT PARAMETERS: UAS-04 MISSION ARCHITECTURE
1. FLIGHT LEVEL: Approved cruise flight ceiling is set to 400ft AGL.
2. COLLISION AVOIDANCE PATHWAY: LiDAR scanning triggers safe detours at a critical 15m threshold.
3. FAILSAFE CONSTRAINTS: Low-power state triggers return-to-home (RTH) procedure when the charge state drops below 20%.
4. COMMUNICATION INTERFACES: Triple-redundant telemetry logs configured over cellular 5G and satellite uplinks.
5. TRANSITION RULE STATEMENTS:
   - IF [GPS_LOSS == TRUE] THEN TRANSITION TO INERTIAL_DRIFT_STEERING.
   - IF [WIND_GUST > 35KTS] THEN INITIATE EMERGENCY_VERTICAL_LANDING immediately.`;
      } else if (lowerPrompt.includes("collateral") || lowerPrompt.includes("liquidation") || lowerPrompt.includes("smart") || lowerPrompt.includes("finance")) {
        aiResponseText = `### FINANCIAL CONTRACT AUDIT: SMART COLLATERAL TRANSITIONS
1. UNDERLYING RATIOS: Liquid liquidation threshold is pegged tightly at 135% collateralization factor.
2. INTEREST CALCULATION ENGINE: Dynamic compound factor is calculated on an epoch-by-epoch blocks interval.
3. SLIPPAGE MAX CONSTRAINTS: Slippage tolerance threshold on major pools must not exceed a maximum variance of 1.25%.
4. SECURITY ENFORCEMENT: Time-delay lock prevents instant collateral removal within 2 blocks of price oracle feeds.
5. DEVIATION METRICS:
   - Oracle deviation threshold limit is strictly locked at 0.5%.
   - Incurred protocol fees are fixed at exactly 50 basis points per collateral execution event.`;
      } else if (lowerPrompt.includes("dosage") || lowerPrompt.includes("clinical") || lowerPrompt.includes("medical") || lowerPrompt.includes("trial")) {
        aiResponseText = `### PHARMACEUTICAL CLINICAL COMPLIANCE REPORT: TRIAL COMPONENT
1. DOSING FORMULA: Target daily active compound ratio is computed as: BaseRatio (0.45mg/kg) * PatientToleranceMultiplier.
2. ABSORPTION LEVEL BOUNDS: Serum level concentration must remain strictly in the 12.5ng/mL to 35.0ng/mL range.
3. ANOMALY THRESHOLDS: Elevated hepatic enzyme detection (>3x upper normal limit) demands instant dosing termination.
4. CO-VARIABLE INTERACTIONS: Prohibit concomitant intake of Class IV agents to prevent renal clearance inhibition.
5. VERIFICATION CHECKS:
   - Double-blind randomization sequence verified via SHA-256 seed.
   - Real-time physiological telemetry is logged at a high-resolution 10Hz polling interval.`;
      } else {
        aiResponseText = `### ENGINEERING EXECUTIVE REPORT: AUTOMATED VERIFICATION OUTPUT
1. OPERATIONAL PROTOCOL: Safe boundaries configured and monitored via autonomous runtime hooks.
2. BOUNDARY CONDITIONS: Upper control threshold = +85.0 units, Lower control threshold = -10.0 units.
3. TRANSITION MECHANISMS: System updates status variables using atomic clock intervals to prevent racing.
4. AUDIT COMPLIANCE: Traceability metrics logged securely at each key stage in standard structured format.
5. EXHAUSTIVE SPECIFICATIONS:
   - Input verified against schema signature: VER_SIG_V2_30_OK
   - Processing cycles consumed: 12.4ms (Simulated Platform Latency)`;
      }
    }

    // --- MODULE 2: VEK Verification Layer ---
    const executionHash = crypto.createHash("sha256").update(aiResponseText).digest("hex").substring(0, 16);
    
    // Check if the output conforms to deterministic engineering constraints
    // (We simulate checking constraints: check if it has structured bullet points, has numbers, is clear)
    const constraintChecks = [
      { id: "C-101", name: "Structured Bullet Point Format", status: aiResponseText.includes("1.") || aiResponseText.includes("-") ? "PASS" : "WARN", description: "Verifies the output uses standard structured layouts for easy semantic parsing" },
      { id: "C-102", name: "Explicit Safety Threshold Bounds", status: /\b\d+(\.\d+)?%|\b\d+(\.\d+)?(ft|m|mg|ng|kts|units|ms)\b/i.test(aiResponseText) ? "PASS" : "WARN", description: "Verifies that quantitative safety boundaries are clearly defined" },
      { id: "C-103", name: "Transition State Rule Consistency", status: aiResponseText.toLowerCase().includes("transition") || aiResponseText.toLowerCase().includes("threshold") || aiResponseText.toLowerCase().includes("limit") ? "PASS" : "WARN", description: "Ensures state rules are present to prevent lockups" },
    ];
    
    const constraintStatus = constraintChecks.every(c => c.status === "PASS") ? "PASS" : "WARNING";

    // --- MODULE 3: Replay Verification ---
    // In a deterministic kernel, we run a replay simulation.
    // If the output can be re-generated exactly, the replay hash matches.
    // If there is ambient noise or non-determinism, it fails.
    const isReplaySuccess = simulateFailure ? false : Math.random() > 0.08;
    const replayHash = isReplaySuccess ? executionHash : crypto.createHash("sha256").update(aiResponseText + " [ambient_noise_delta]").digest("hex").substring(0, 16);
    const replayDifference = isReplaySuccess 
      ? "" 
      : "Non-deterministic delta detected in state transitions at offset 0x08A1. Simulated state difference: [Transition clock drift detected (+2.4ms variance)].";

    // --- MODULE 4: Evidence Analysis Engine ---
    // Evaluate output support against simulated evidence files
    const evidenceCorrelation = [
      { source: "Engineering Spec Doc v4.2", strength: 0.95, consistency: "100%", status: "Strong Support" },
      { source: "Field Telemetry Log Baseline", strength: 0.88, consistency: "94%", status: "Correlated" },
      { source: "Safety Standards ISO-26262 / DO-178C", strength: 0.92, consistency: "98%", status: "Compliant" },
      { source: "Alternative Path Transition Rulebook", strength: 0.45, consistency: "60%", status: "Weak / Plausible" }
    ];

    const hasConflict = simulateFailure ? true : false;
    const conflictDescription = hasConflict 
      ? "Conflict identified: Core parameter contradicts alternative boundary policy set in Alternative Path Transition Rulebook."
      : "No direct contradictions or parameter conflicts detected in standard evidence channels.";

    // --- MODULE 5: Confidence Scoring ---
    let evidenceSupportScore = isRealGemini ? 95 : 88;
    let consistencyScore = isReplaySuccess ? 96 : 40;
    let alternativeSeparation = hasConflict ? 35 : 80;
    
    // Adjust values if simulateFailure is active
    if (simulateFailure) {
      evidenceSupportScore = 60;
      consistencyScore = 30;
      alternativeSeparation = 20;
    }

    const confidenceValue = (evidenceSupportScore * 0.4) + (consistencyScore * 0.4) + (alternativeSeparation * 0.2);
    let confidence: "Low" | "Medium" | "High" | "Very High" = "High";
    if (confidenceValue > 90) confidence = "Very High";
    else if (confidenceValue > 70) confidence = "High";
    else if (confidenceValue > 45) confidence = "Medium";
    else confidence = "Low";

    const confidenceExplanation = isReplaySuccess 
      ? `High confidence is driven by a 100% deterministic replay match, solid correlation with baseline engineering specifications (${evidenceSupportScore}%), and clear mathematical parameter separation.`
      : `Reduced confidence is caused by replay non-determinism (PASS failure during delta verification) and elevated transition state uncertainty.`;

    // --- MODULE 6: Engineering Report ---
    const decisionHash = crypto.createHash("sha256").update(executionHash + replayHash + confidence).digest("hex").substring(0, 16);
    
    // Create new Audit Ledger Record
    const newRecord: AuditRecord = {
      id: `AL-${Math.floor(8942 + Math.random() * 5000)}`,
      sessionID,
      traceID,
      timestamp,
      prompt,
      executionHash,
      replayHash,
      decisionHash,
      confidence,
      status: isReplaySuccess && !hasConflict ? "PASS" : "FAIL",
      category: prompt.length % 4 === 0 ? "Aerospace" : prompt.length % 3 === 0 ? "Finance" : prompt.length % 2 === 0 ? "Healthcare" : "Industrial"
    };

    auditLedger.unshift(newRecord);

    const report = {
      input: prompt,
      output: aiResponseText,
      metadata: {
        sessionID,
        traceID,
        timestamp,
        isRealGemini,
        processingTimeMs: Math.floor(250 + Math.random() * 350)
      },
      verification: {
        status: isReplaySuccess && !hasConflict ? "PASS" : "FAIL",
        executionHash,
        replayHash,
        decisionHash,
        constraintStatus,
        constraintChecks,
        replayStatus: isReplaySuccess ? "PASS" : "FAIL",
        replayDifference
      },
      evidence: {
        correlation: evidenceCorrelation,
        conflict: {
          hasConflict,
          description: conflictDescription
        }
      },
      confidence: {
        level: confidence,
        score: Math.round(confidenceValue),
        metrics: {
          evidenceSupport: evidenceSupportScore,
          consistency: consistencyScore,
          alternativeSeparation
        },
        explanation: confidenceExplanation
      },
      warnings: !isReplaySuccess 
        ? ["Replay verification non-determinism detected.", "State transition rules showed timing drift."] 
        : hasConflict 
        ? ["Alternative support model indicates minor parameter conflicts."] 
        : [],
      suggestedNextSteps: !isReplaySuccess 
        ? ["Isolate non-deterministic variables in state delta.", "Review thread safety during high-frequency execution cycles."] 
        : ["Deploy to secondary staging environments.", "Publish immutable execution proof to decentralized audit ledger."]
    };

    res.json(report);
  } catch (error: any) {
    console.error("Verification processing failed:", error);
    res.status(500).json({ error: "Internal verification processing failed: " + error.message });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VEK Console Server v2.3.0] running on http://localhost:${PORT}`);
  });
}

startServer();
