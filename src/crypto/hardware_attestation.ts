import crypto from "crypto";
import os from "os";
import fs from "fs";
import path from "path";

const KEYS_DIR = path.join(process.cwd(), "evaluation-kit/keys");
const TPM_PRIVATE_KEY_PATH = path.join(KEYS_DIR, "tpm_private.pem");
const TPM_PUBLIC_KEY_PATH = path.join(KEYS_DIR, "tpm_public.pem");

/**
 * Gets or generates a simulated non-exportable TPM 2.0 endorsement key pair.
 */
export function getOrGenerateTPMKeyPair(): { privateKey: string; publicKey: string } {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  if (fs.existsSync(TPM_PRIVATE_KEY_PATH) && fs.existsSync(TPM_PUBLIC_KEY_PATH)) {
    const privateKey = fs.readFileSync(TPM_PRIVATE_KEY_PATH, "utf8");
    const publicKey = fs.readFileSync(TPM_PUBLIC_KEY_PATH, "utf8");
    return { privateKey, publicKey };
  }

  // Generate standard 2048-bit RSA key pair simulating TPM root key
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

  fs.writeFileSync(TPM_PRIVATE_KEY_PATH, privateKey);
  fs.writeFileSync(TPM_PUBLIC_KEY_PATH, publicKey);

  return { privateKey, publicKey };
}

/**
 * Generates hardware fingerprint based on system identity specs.
 */
export function getHardwareFingerprint(): string {
  const payload = {
    platform: process.platform,
    arch: process.arch,
    cores: os.cpus().length || 1,
    cpuModel: os.cpus()[0]?.model || "unknown-cpu",
    totalMem: os.totalmem(),
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

/**
 * Checks and returns simulated or real TEE (SGX/TDX) context environment status.
 */
export function getTEEStatus() {
  const isCI = !!process.env.GITHUB_ACTIONS;
  return {
    sgx: isCI || process.env.SGX_ENABLED === "true",
    tdx: process.env.TDX_ENABLED === "true",
    secureEnclave: process.env.SECURE_ENCLAVE === "true" || process.platform === "darwin",
  };
}

/**
 * Generates complete Hardware Root of Trust evidence for the report payload.
 */
export function generateHardwareAttestation(reportHash: string) {
  const { privateKey, publicKey } = getOrGenerateTPMKeyPair();
  
  // Sign the report hash with the TPM endorsement key (simulates hardware-bound key execution)
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(reportHash);
  sign.end();
  const tpmSignedHash = sign.sign(privateKey, "hex");

  return {
    tpm_signed_hash: tpmSignedHash,
    tpm_public_key: publicKey,
    hardware_id: getHardwareFingerprint(),
    tee_status: getTEEStatus(),
  };
}

/**
 * Validates the hardware attestation signature offline.
 */
export function verifyHardwareAttestation(reportHash: string, attestation: any): boolean {
  try {
    if (!attestation || !attestation.tpm_signed_hash || !attestation.tpm_public_key) {
      return false;
    }
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(reportHash);
    verify.end();
    return verify.verify(attestation.tpm_public_key, attestation.tpm_signed_hash, "hex");
  } catch (err) {
    return false;
  }
}
