/**
 * Performance benchmark for optimization validation
 * Run with: npm run test -- --reporter=verbose src/utils/__tests__/benchmark.test.ts
 */

import { beforeEach, describe, expect, it } from "vitest";
import { bytecodeCache, isDisperseContract } from "../contractVerify";
import { parseRecipients } from "../parseRecipients";
import { measurePerformance } from "../performance";

describe("Performance Benchmarks", () => {
  beforeEach(() => {
    bytecodeCache.clear();
  });

  describe("Contract verification performance", () => {
    const testBytecode = "0x608060405234801561001057600080fd5b50deadbeef";

    it("should cache contract verification results efficiently", () => {
      let firstCallTime = 0;
      let secondCallTime = 0;

      // First call (no cache)
      const firstResult = measurePerformance("contract-verify-first", () => {
        const start = performance.now();
        const result = isDisperseContract(testBytecode);
        firstCallTime = performance.now() - start;
        return result;
      });

      // Second call (should use cache)
      const secondResult = measurePerformance("contract-verify-cached", () => {
        const start = performance.now();
        const result = isDisperseContract(testBytecode);
        secondCallTime = performance.now() - start;
        return result;
      });

      expect(firstResult).toBe(secondResult);
      expect(bytecodeCache.has(testBytecode)).toBe(true);

      // Cache hit should be significantly faster (at least 50% faster)
      expect(secondCallTime).toBeLessThan(firstCallTime * 0.5);

      console.log(
        `Contract verification - First call: ${firstCallTime.toFixed(3)}ms, Cached call: ${secondCallTime.toFixed(3)}ms`,
      );
    });

    it("should handle multiple different bytecodes efficiently", () => {
      const bytecodes = [
        "0x608060405234801561001057600080fd5b50",
        "0x608060405234801561001057600080fd5b51",
        "0x608060405234801561001057600080fd5b52",
        "0xdeadbeef",
        "0x1234567890abcdef",
      ];

      const startTime = performance.now();

      // Process each bytecode twice to test caching
      for (let i = 0; i < 2; i++) {
        for (const bytecode of bytecodes) {
          isDisperseContract(bytecode);
        }
      }

      const totalTime = performance.now() - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(50); // 50ms for 10 operations
      expect(bytecodeCache.size).toBe(bytecodes.length);

      console.log(`Multiple bytecode verification (${bytecodes.length * 2} operations): ${totalTime.toFixed(3)}ms`);
    });
  });

  describe("Recipient parsing performance", () => {
    it("should parse recipients efficiently", () => {
      const recipientData = Array.from({ length: 100 }, (_, i) => `0x${"1".repeat(40)} ${(i + 1).toString()}`).join(
        "\n",
      );

      const parseTime = measurePerformance("parse-recipients", () => {
        const start = performance.now();
        const result = parseRecipients(recipientData, 18);
        const end = performance.now();

        expect(result).toHaveLength(100);
        return end - start;
      });

      // Should parse 100 recipients in under 100ms
      expect(parseTime).toBeLessThan(100);

      console.log(`Parsing 100 recipients: ${parseTime.toFixed(3)}ms`);
    });

    it("should handle large recipient lists efficiently", () => {
      const recipientData = Array.from({ length: 1000 }, (_, i) => `0x${"a".repeat(40)} ${(i + 1).toString()}.5`).join(
        "\n",
      );

      const parseTime = measurePerformance("parse-large-recipients", () => {
        const start = performance.now();
        const result = parseRecipients(recipientData, 18);
        const end = performance.now();

        expect(result).toHaveLength(1000);
        return end - start;
      });

      // Should parse 1000 recipients in under 500ms
      expect(parseTime).toBeLessThan(500);

      console.log(`Parsing 1000 recipients: ${parseTime.toFixed(3)}ms`);
    });
  });

  describe("Memory efficiency", () => {
    it("should not leak memory with repeated contract verifications", () => {
      const initialCacheSize = bytecodeCache.size;

      // Generate many unique bytecodes and verify them
      for (let i = 0; i < 100; i++) {
        const bytecode = `0x608060405234801561001057600080fd5b${i.toString().padStart(2, "0")}`;
        isDisperseContract(bytecode);
      }

      expect(bytecodeCache.size).toBe(initialCacheSize + 100);

      // Clear cache and verify it's cleaned up
      bytecodeCache.clear();
      expect(bytecodeCache.size).toBe(0);
    });
  });
});
