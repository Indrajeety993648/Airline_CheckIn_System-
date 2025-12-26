/**
 * Generate a unique boarding pass code
 */
export function generateBoardingPass(pnr: string, flightNumber: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BP-${flightNumber}-${pnr}-${timestamp}${random}`;
}
