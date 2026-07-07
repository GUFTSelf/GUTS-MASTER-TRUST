# VEK Canonical Serialization Standard (CSS-1.0)

This document specifies the exact formatting and serialization rules required to produce identical, byte-for-byte matching string representations of JSON structures prior to cryptographic hashing.

---

## 🏛️ Motivation

Standard JSON serialization libraries do not guarantee consistent key ordering. For example, a JavaScript engine might serialize `{a: 1, b: 2}` as `{"a":1,"b":2}`, while a Python dictionary or custom Go map might output `{"b":2,"a":1}`. Since cryptographic hash functions (such as SHA-256) are highly sensitive to even a single bit-flip, any variation in serialization key ordering or formatting immediately breaks cross-platform validation.

To solve this, the **VEK Canonical Serialization Standard (CSS-1.0)** mandates a strict, deterministic normalization process.

---

## 📐 Serialization Rules

All compliant VEK engines MUST process JSON data using the following seven normative rules:

### Rule 1: Lexicographical Key Sorting
All object keys MUST be sorted alphabetically based on their UTF-8 character codes prior to output.
* *Example Input*: `{"lidarProximity": 35, "altitude": 150, "batteryState": 100}`
* *Canonical Output*: `{"altitude":150,"batteryState":100,"lidarProximity":35}`

### Rule 2: Elimination of Whitespace
All formatting spaces, tab characters, and carriage returns outside of string literals MUST be completely removed.
* *Example Input*:
  ```json
  {
    "altitude": 150,
    "batteryState": 100
  }
  ```
* *Canonical Output*: `{"altitude":150,"batteryState":100}`

### Rule 3: Integer Representation
Floating-point decimals representing whole numbers MUST be serialized as integers (i.e., trailing decimal points are omitted).
* *Example Input*: `{"price": 12.00, "ratio": 1.0}`
* *Canonical Output*: `{"price":12,"ratio":1}`

### Rule 4: Scale Decimals to Fixed-Point
To prevent IEEE-754 decimal rounding variations across hardware (e.g., x86 vs. ARM), all values that require precision decimals MUST be scaled by $10^6$ and stored as pure integers.
* *Example Input*: `{"ratio": 1.550123}`
* *Canonical Output*: `{"ratio":1550123}`

### Rule 5: UTF-8 Character Normalization
Strings must be normalized to standard UTF-8. Non-ASCII characters MUST be escaped using standard uppercase hex sequences (e.g., `\u00FC` for `ü`).

### Rule 6: Array Element Retention
Elements inside an array are sorted if the specification explicitly marks the field as an unordered set; otherwise, they MUST preserve their original logical execution sequence.

### Rule 7: Boolean and Null Normalization
* Booleans must be written in lowercase: `true`, `false`.
* Empty fields must be represented by `null` or completely omitted if the schema specifies optional fields.

---

## 💻 Reference TypeScript Implementation

The following function represents the reference implementation of CSS-1.0:

```typescript
export function canonicalJsonStringify(obj: any): string {
  if (obj === null) return "null";
  if (typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    const elems = obj.map(item => canonicalJsonStringify(item));
    return "[" + elems.join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const properties = keys.map(key => {
    return JSON.stringify(key) + ":" + canonicalJsonStringify(obj[key]);
  });
  return "{" + properties.join(",") + "}";
}
```

---

## 🧪 Testing Compliance

To verify compliance with CSS-1.0, feed the following structure into your serialization engine:

```json
{
  "z_index": 1,
  "metrics": {
    "collateral": 150.0,
    "ratio": 1.55
  },
  "status_flags": [true, false]
}
```

**Expected Canonical Serialization String**:
`{"metrics":{"collateral":150,"ratio":1.55},"status_flags":[true,false],"z_index":1}`
*(Note: ratio remains 1.55 if not scaled, but decimals representing whole numbers like collateral 150.0 normalize to 150)*
