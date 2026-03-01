/**
 * Tailwind CSS utility classes for consistent styling
 */

// Button styles
export const BUTTON_STYLES = {
  primary:
    'flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#29E7CD] to-[#3B82F6] px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#29E7CD]/25 focus:ring-2 focus:ring-[#29E7CD] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:outline-none',
  secondary:
    'flex min-h-[48px] items-center justify-center rounded-2xl bg-[#2a2a2a] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#2a2a2a]/80 focus:ring-2 focus:ring-[#29E7CD] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:outline-none',
  ghost:
    'flex min-h-[48px] items-center justify-center rounded-2xl px-6 py-4 text-sm font-semibold text-gray-300 transition-all duration-300 hover:bg-[#2a2a2a]/50 hover:text-white focus:ring-2 focus:ring-[#29E7CD] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:outline-none',
} as const;
