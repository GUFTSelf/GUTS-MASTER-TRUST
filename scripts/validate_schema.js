// scripts/validate_schema.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_PATH = path.resolve(__dirname, '../evaluation-kit/output/evaluation_report.json');
const SCHEMA_PATH = path.resolve(__dirname, '../schemas/evaluation_report.schema.json');

console.log("\x1b[36m=== VEK REPORT SCHEMA VALIDATOR ===\x1b[0m");

if (!fs.existsSync(REPORT_PATH)) {
  console.error(`\x1b[31m[ERROR] Evaluation report not found at ${REPORT_PATH}. Please run 'npm run report' first.\x1b[0m`);
  process.exit(1);
}

if (!fs.existsSync(SCHEMA_PATH)) {
  console.error(`\x1b[31m[ERROR] Schema contract not found at ${SCHEMA_PATH}.\x1b[0m`);
  process.exit(1);
}

try {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

  let errors = [];

  function checkType(value, expectedType, pathStr) {
    if (expectedType === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`Field '${pathStr}' expected array, got ${typeof value}`);
      }
    } else if (expectedType === 'object') {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`Field '${pathStr}' expected object, got ${typeof value}`);
      }
    } else {
      if (typeof value !== expectedType) {
        errors.push(`Field '${pathStr}' expected ${expectedType}, got ${typeof value}`);
      }
    }
  }

  // Recursive validation based on schema definitions
  function validate(data, schemaNode, pathStr = 'root') {
    if (!schemaNode) return;

    // Check type
    if (schemaNode.type) {
      checkType(data, schemaNode.type, pathStr);
    }

    // Check required fields
    if (schemaNode.required && typeof data === 'object' && data !== null) {
      for (const req of schemaNode.required) {
        if (!(req in data)) {
          errors.push(`Missing required field '${pathStr}.${req}'`);
        }
      }
    }

    // Check children properties
    if (schemaNode.properties && typeof data === 'object' && data !== null) {
      for (const [key, val] of Object.entries(data)) {
        if (schemaNode.properties[key]) {
          validate(val, schemaNode.properties[key], `${pathStr}.${key}`);
        }
      }
    }
  }

  validate(report, schema);

  if (errors.length > 0) {
    console.error(`\x1b[31m[SCHEMA FAIL] Found ${errors.length} validation deviations:\x1b[0m`);
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log(`\x1b[32m[SCHEMA PASS] '${path.basename(REPORT_PATH)}' conforms 100% to '${path.basename(SCHEMA_PATH)}'!\x1b[0m`);
  }
} catch (err) {
  console.error(`\x1b[31m[ERROR] Failed to run schema validation: ${err.message}\x1b[0m`);
  process.exit(1);
}
