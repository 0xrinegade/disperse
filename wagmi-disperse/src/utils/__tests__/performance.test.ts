import { describe, expect, it, vi } from "vitest";
import { debounce, measurePerformance, scheduleAfterPaint } from "../performance";

describe("Performance utilities", () => {
  describe("scheduleAfterPaint", () => {
    it("should schedule callback after paint", () => {
      const mockCallback = vi.fn();
      const mockRequestAnimationFrame = vi.fn((cb) => {
        cb();
        return 1;
      });

      // Mock requestAnimationFrame
      global.requestAnimationFrame = mockRequestAnimationFrame;

      scheduleAfterPaint(mockCallback);

      expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
      expect(mockCallback).toHaveBeenCalled();
    });

    it("should handle focus element option", () => {
      const mockCallback = vi.fn();
      const mockElement = { focus: vi.fn() };
      const mockRequestAnimationFrame = vi.fn((cb) => {
        cb();
        return 1;
      });

      global.requestAnimationFrame = mockRequestAnimationFrame;

      scheduleAfterPaint(mockCallback, { focusElement: mockElement as any });

      expect(mockElement.focus).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
    });

    it("should handle parseAmounts option", () => {
      const mockCallback = vi.fn();
      const mockParseAmounts = vi.fn();
      const mockRequestAnimationFrame = vi.fn((cb) => {
        cb();
        return 1;
      });

      global.requestAnimationFrame = mockRequestAnimationFrame;

      scheduleAfterPaint(mockCallback, { parseAmounts: mockParseAmounts });

      expect(mockCallback).toHaveBeenCalled();
      expect(mockParseAmounts).toHaveBeenCalled();
    });
  });

  describe("debounce", () => {
    it("should debounce function calls", (done) => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce period
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    it("should pass arguments correctly", (done) => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn("arg1", "arg2");

      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
        done();
      }, 100);
    });
  });

  describe("measurePerformance", () => {
    it("should measure performance when performance API is available", () => {
      const mockPerformance = {
        mark: vi.fn(),
        measure: vi.fn(),
      };

      // Mock performance API
      global.performance = mockPerformance as any;

      const testFn = () => "result";
      const result = measurePerformance("test", testFn);

      expect(result).toBe("result");
      expect(mockPerformance.mark).toHaveBeenCalledWith("test-start");
      expect(mockPerformance.mark).toHaveBeenCalledWith("test-end");
      expect(mockPerformance.measure).toHaveBeenCalledWith("test", "test-start", "test-end");
    });

    it("should work without performance API", () => {
      // Remove performance API
      global.performance = undefined as any;

      const testFn = () => "result";
      const result = measurePerformance("test", testFn);

      expect(result).toBe("result");
    });

    it("should work when performance.mark is undefined", () => {
      global.performance = {} as any;

      const testFn = () => "result";
      const result = measurePerformance("test", testFn);

      expect(result).toBe("result");
    });
  });
});
