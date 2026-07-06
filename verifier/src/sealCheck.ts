import crypto from "crypto";
import { ExecutionProofObject, EpoSignature } from "./loadEPO";

export function verifySignature(hash: string, signature: string, publicKey: string): boolean {
  try {
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(hash);
    verify.end();
    return verify.verify(publicKey, signature, "hex");
  } catch (err) {
    return false;
  }
}

export function verifySeal(epo: ExecutionProofObject): boolean {
  if (!epo.signature) {
    return false;
  }

  let signatureStr: string;
  let publicKeyStr: string;
  let payloadToVerify: string;

  if (epo.epo_version === "2.1" && typeof epo.signature === "object" && epo.signature !== null) {
    const sigObj = epo.signature as EpoSignature;
    signatureStr = sigObj.signature;
    publicKeyStr = sigObj.public_key;
    payloadToVerify = `${epo.execution_id}:${epo.proof_hash}:${epo.final_state_hash}`;
  } else if (typeof epo.signature === "string") {
    signatureStr = epo.signature;
    publicKeyStr = epo.publicKey || "";
    payloadToVerify = epo.proof_hash;
  } else {
    return false;
  }

  if (!signatureStr || !publicKeyStr) {
    return false;
  }

  // Verification in Node crypto:
  // Convert signature from base64/hex to verify
  try {
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(payloadToVerify);
    verify.end();

    // Check if signature is base64 (which RSA-SHA256 signature in v2.1 usually is) or hex
    let signatureBuffer: Buffer;
    if (signatureStr.startsWith("0x") || /^[0-9a-fA-F]+$/.test(signatureStr)) {
      const cleanSig = signatureStr.startsWith("0x") ? signatureStr.slice(2) : signatureStr;
      signatureBuffer = Buffer.from(cleanSig, "hex");
    } else {
      signatureBuffer = Buffer.from(signatureStr, "base64");
    }

    return verify.verify(publicKeyStr, signatureBuffer);
  } catch (err) {
    return false;
  }
}
