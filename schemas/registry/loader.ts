import fs from "fs";
import path from "path";

const REGISTRY_INDEX = {
  "epo": {
    "1.0": "schemas/registry/epo/v1.json",
    "2.1": "schemas/registry/epo/v2.json"
  },
  "trace": {
    "1.0": "schemas/registry/trace/v1.json"
  },
  "seal": {
    "1.0": "schemas/registry/seal/v1.json"
  }
};

export function loadSchema(type: "epo" | "trace" | "seal", version: string): any {
  const typedRegistry = REGISTRY_INDEX[type] as Record<string, string> | undefined;
  if (!typedRegistry) {
    throw new Error(`Invalid schema type: ${type}`);
  }

  const schemaRelativePath = typedRegistry[version];
  if (!schemaRelativePath) {
    throw new Error(`Schema mismatch: version ${version} of type ${type} is not registered in the Canonical Schema Registry.`);
  }

  try {
    const absolutePath = path.resolve(process.cwd(), schemaRelativePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Schema file not found on disk: ${schemaRelativePath}`);
    }
    const raw = fs.readFileSync(absolutePath, "utf-8");
    return JSON.parse(raw);
  } catch (err: any) {
    throw new Error(`Failed to load schema from registry: ${err.message}`);
  }
}

export function validateSchemaHeader(artifact: any, expectedType: "epo" | "trace" | "seal", expectedVersion: string): void {
  const schema = artifact.schema || (artifact.epo_version ? "epo" : null);
  const version = artifact.version || artifact.epo_version || null;

  if (!schema || !version) {
    throw new Error(`Invalid artifact metadata: missing 'schema' or 'version' authority stamp.`);
  }

  if (schema !== expectedType || version !== expectedVersion) {
    throw new Error(`Hard Invariant Mismatch: expected ${expectedType} v${expectedVersion}, but artifact declared ${schema} v${version}. Handshake failed before execution.`);
  }
}
