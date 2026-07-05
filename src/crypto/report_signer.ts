import crypto from "crypto";
import fs from "fs";
import path from "path";

const KEYS_DIR = path.join(process.cwd(), "evaluation-kit/keys");
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "private.pem");
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, "public.pem");

/**
 * Generates or retrieves an RSA-2048 keypair.
 */
export function getOrGenerateKeyPair(): { privateKey: string; publicKey: string } {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
    const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
    return { privateKey, publicKey };
  }

  // Generate standard 2048-bit RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);

  return { privateKey, publicKey };
}

/**
 * Computes a canonical SHA-256 hash of the JSON report.
 */
export function hashReport(report: any): string {
  // Sort properties for a canonical structure
  const cleanReport = { ...report };
  delete cleanReport.integrity_evidence; // exclude the envelope container itself to avoid self-reference
  
  const canonical = JSON.stringify(cleanReport, Object.keys(cleanReport).sort());
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

/**
 * Signs the report JSON with the private key.
 */
export function signReport(report: any): { report_hash: string; signature: string; publicKey: string } {
  const { privateKey, publicKey } = getOrGenerateKeyPair();
  const hash = hashReport(report);

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(hash);
  sign.end();

  const signature = sign.sign(privateKey, "hex");

  return {
    report_hash: hash,
    signature,
    publicKey,
  };
}

/**
 * Verifies the signature of the report with a public key.
 */
export function verifyReportSignature(report: any, signature: string, publicKey: string): boolean {
  try {
    const hash = hashReport(report);
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(hash);
    verify.end();

    return verify.verify(publicKey, signature, "hex");
  } catch (err) {
    console.error("[Crypto Signer] Verification error:", err);
    return false;
  }
}
