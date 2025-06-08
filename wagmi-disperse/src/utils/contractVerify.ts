import { disperse_createx, disperse_legacy, disperse_runtime } from "../deploy";

// Cache for bytecode verification results - exported for testing
export const bytecodeCache = new Map<string, boolean>();

/**
 * Check if bytecode starts with the expected Disperse contract runtime
 * This performs verification to protect against malicious contracts
 * Optimized version with reduced logging and improved caching
 *
 * @param bytecode Contract bytecode to check
 * @returns true if the bytecode starts with the Disperse runtime
 */
export function isDisperseContract(bytecode: string | undefined): boolean {
  // Return cached result if available
  if (bytecode && bytecodeCache.has(bytecode)) {
    return bytecodeCache.get(bytecode) ?? false;
  }

  // Check if bytecode is empty or undefined
  if (!bytecode || bytecode === "0x") {
    bytecodeCache.set(bytecode || "", false);
    return false;
  }

  // Remove "0x" prefix for comparison if present and convert to lowercase for case-insensitive comparison
  const cleanBytecode = (bytecode.startsWith("0x") ? bytecode.substring(2) : bytecode).toLowerCase();
  const cleanRuntime = (
    disperse_runtime.startsWith("0x") ? disperse_runtime.substring(2) : disperse_runtime
  ).toLowerCase();

  // Quick length check for efficiency
  if (cleanBytecode.length < cleanRuntime.length) {
    bytecodeCache.set(bytecode, false);
    return false;
  }

  // Check if the bytecode starts with our runtime (most common case)
  const startsWithRuntime = cleanBytecode.startsWith(cleanRuntime);

  // Cache the result
  bytecodeCache.set(bytecode, startsWithRuntime);

  // Only log in development or when verification fails
  if (import.meta.env.DEV || !startsWithRuntime) {
    console.log(`[CONTRACT-VERIFY] ${startsWithRuntime ? "✅ VALID" : "❌ INVALID"} contract verification`);
  }

  return startsWithRuntime;
}

/**
 * Get the Disperse contract addresses to check for deployment
 * We check both the legacy address and the CreateX deployed address
 */
export const getDisperseAddresses = (): { address: string; label: string }[] => {
  return [
    { address: disperse_legacy.address, label: "legacy" },
    { address: disperse_createx.address, label: "createx" },
  ];
};

/**
 * Check if we can deploy on this network
 * @param chainId Network chain ID
 * @returns true if deployment is allowed on this network
 */
export function canDeployToNetwork(chainId: number | undefined): boolean {
  if (!chainId) return false;

  // Allow deployment on any EVM-compatible chain
  // We're assuming that if the chain ID is available, it's an EVM chain
  // that should support contract deployment
  return true;

  // Alternatively, you could have a blocklist of chains where deployment is known to be problematic:
  /*
  const unsupportedChains = [
    // List chains that are either non-EVM or have issues with deployment
    // For example, some Layer 2 solutions might have specific deployment requirements
  ];
  
  return !unsupportedChains.includes(chainId);
  */
}
