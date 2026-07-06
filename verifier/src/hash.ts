import crypto from "crypto";

// Canonical JSON Stringifier to guarantee lexicographically sorted keys and no whitespace variance.
export function canonicalJsonStringify(val: any): string {
  if (val === null) return "null";
  if (typeof val === "number") {
    return Number.isFinite(val) ? String(val) : "null";
  }
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "string") {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map(v => canonicalJsonStringify(v)).join(",") + "]";
  }
  if (typeof val === "object") {
    const keys = Object.keys(val).sort();
    const properties = keys.map(k => {
      return JSON.stringify(k) + ":" + canonicalJsonStringify(val[k]);
    });
    return "{" + properties.join(",") + "}";
  }
  return "null";
}

export function sha256Sync(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

export function sha512Sync(str: string): string {
  return crypto.createHash("sha512").update(str).digest("hex");
}
