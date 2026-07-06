import fs from "fs";
import path from "path";

export function loadInput(filePath: string): any {
  try {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Input file not found at path: ${filePath}`);
    }
    const raw = fs.readFileSync(absolutePath, "utf-8");
    return JSON.parse(raw);
  } catch (err: any) {
    throw new Error(`Failed to load or parse input file: ${err.message}`);
  }
}
