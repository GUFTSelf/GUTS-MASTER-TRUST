export interface ConstraintCheck {
  id: string;
  name: string;
  status: "PASS" | "WARN" | "FAIL";
  description: string;
}

export interface EvidenceRecord {
  source: string;
  strength: number;
  consistency: string;
  status: string;
}

export interface VerificationReport {
  input: string;
  output: string;
  metadata: {
    sessionID: string;
    traceID: string;
    timestamp: string;
    isRealGemini: boolean;
    processingTimeMs: number;
  };
  verification: {
    status: "PASS" | "FAIL";
    executionHash: string;
    replayHash: string;
    decisionHash: string;
    constraintStatus: string;
    constraintChecks: ConstraintCheck[];
    replayStatus: "PASS" | "FAIL";
    replayDifference: string;
  };
  evidence: {
    correlation: EvidenceRecord[];
    conflict: {
      hasConflict: boolean;
      description: string;
    };
  };
  confidence: {
    level: "Low" | "Medium" | "High" | "Very High";
    score: number;
    metrics: {
      evidenceSupport: number;
      consistency: number;
      alternativeSeparation: number;
    };
    explanation: string;
  };
  warnings: string[];
  suggestedNextSteps: string[];
}

export interface AuditRecord {
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

export interface BenchmarkMetrics {
  executionLatency: number;
  replayLatency: number;
  constraintChecks: number;
  memoryUsage: number;
  cpuUsage: number;
  replayMatchRate: number;
  tamperDetection: number;
  auditEntries: number;
}
