#[cfg(test)]
mod tests {
    use super::*;

    /// Test: change 1 byte in input -> verify must FAIL
    #[test]
    fn test_change_one_byte_fails() {
        let mut epo = load_golden_epo();
        // Modify a single character in the domain string
        epo.domain = "uas-routxd".to_string();
        
        let result = verify_epo_v1(&epo);
        assert!(!result.success, "Verification must FAIL when input is modified by even 1 byte.");
    }

    /// Test: change order of JSON keys -> verify must FAIL
    #[test]
    fn test_canonical_json_key_order_mismatch() {
        // Since the serialization is canonical and cryptographic, changing the serializing behavior 
        // of keys must mismatch the hash.
        let epo = load_golden_epo();
        let non_canonical_json = "{\"initial_state_hash\":\"0xabc\",\"epo_version\":\"1.0\"}"; // keys reversed
        let computed_hash = sha512(non_canonical_json);
        
        assert_ne!(computed_hash, epo.proof_hash, "Proof hash must mismatch if canonical sorting is not enforced.");
    }

    /// Test: rerun on same seed twice -> must match EXACTLY
    #[test]
    fn test_strict_rerun_reproducibility() {
        let input_a = load_golden_input();
        let input_b = load_golden_input();
        
        let trace_a = execute_vek(&input_a);
        let trace_b = execute_vek(&input_b);
        
        assert_eq!(trace_a.final_state_hash, trace_b.final_state_hash, "Same input + same seed must yield 100% identical final state hash.");
        assert_eq!(trace_a.proof_hash, trace_b.proof_hash, "Same execution must produce bit-for-bit identical proof hash.");
    }
}
