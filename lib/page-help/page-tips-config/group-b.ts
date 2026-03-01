import type { PageTipsConfig } from '../page-tips-types';

export const PAGE_TIPS_GROUP_B: Record<string, PageTipsConfig> = {
  'par-levels': {
    pageKey: 'par-levels',
    tips: [
      'Set par levels per ingredient—minimum stock you want on hand.',
      'Reorder point triggers when stock dips below par. Use for order lists.',
      'Bulk select to update multiple ingredients at once.',
      'Export or print your par levels for kitchen reference.',
    ],
  },
  'order-lists': {
    pageKey: 'order-lists',
    tips: [
      'Select a menu to generate an ingredient order list.',
      'Ingredients are grouped by storage location, name, or category.',
      'Order lists pull from recipes and dishes in the selected menu.',
      'Use with par levels for smarter reorder decisions.',
    ],
    guideId: 'getting-started',
    guideStepIndex: 4,
  },
  dashboard: {
    pageKey: 'dashboard',
    tips: [
      'Stats show your kitchen at a glance—ingredients, recipes, temperature, and more.',
      'Quick Actions take you straight to common tasks.',
      'Temperature alerts highlight equipment that needs attention.',
      'Click through any widget to drill down into details.',
    ],
    guideId: 'getting-started',
    guideStepIndex: 0,
  },
  ingredients: {
    pageKey: 'ingredients',
    tips: [
      'Add ingredients with costs and suppliers—your Recipe Book builds from this.',
      'Import from CSV for quick bulk setup.',
      'Filter by storage location or supplier to find what you need.',
      'Bulk actions let you update multiple ingredients at once.',
    ],
    guideId: 'getting-started',
    guideStepIndex: 1,
  },
  performance: {
    pageKey: 'performance',
    tips: [
      'Generate sales data first to see menu profitability.',
      "Chef's Kiss = profitable and popular. Hidden Gem = profitable but slow. Bargain Bucket = popular but slim margins. Burnt Toast = neither.",
      'Use filters to compare periods or drill into categories.',
      'Export to CSV for your own analysis.',
    ],
    guideId: 'getting-started',
    guideStepIndex: 4,
  },
  cogs: {
    pageKey: 'cogs',
    tips: [
      'Add recipes or dishes to the calculator to see cost breakdown.',
      'Adjust selling price to hit your target margin.',
      'Save calculations back to your Recipe Book when ready.',
      'Use the Calculator tab for quick pricing experiments.',
    ],
    guideId: 'create-recipe',
    guideStepIndex: 0,
  },
  'recipe-sharing': {
    pageKey: 'recipe-sharing',
    tips: [
      'Share recipes as PDF, link, or email—recipients get full instructions.',
      'Choose a recipe first, then pick how you want to share it.',
      "Email shares go straight to the recipient's inbox.",
      'PDF downloads are great for printing or archiving.',
    ],
  },
  sections: {
    pageKey: 'sections',
    tips: [
      'Create kitchen sections to organize your prep output.',
      'Assign dishes to sections—prep lists and order lists use these.',
      'Match sections to your physical kitchen layout.',
      'Unassigned dishes can be assigned from the list at the bottom.',
    ],
  },
  cleaning: {
    pageKey: 'cleaning',
    tips: [
      'Add areas and tasks to build your cleaning schedule.',
      'Assign tasks to roster shifts for accountability.',
      'Track completion as you go—green when done.',
      'Use the Areas tab to manage your cleaning zones.',
    ],
  },
  specials: {
    pageKey: 'specials',
    tips: [
      'AI suggests specials from your menu based on ingredients and trends.',
      'Filter by ready-to-cook, cuisines, or tags to narrow it down.',
      'Customize and promote the ones you like.',
      'Add ingredients to refine suggestions to what you have on hand.',
    ],
  },
  setup: {
    pageKey: 'setup',
    tips: [
      'One-time setup for equipment, suppliers, and base data.',
      'Run when starting fresh or onboarding a new venue.',
      'Populate clean data gives you sample ingredients and recipes.',
      'Country setup configures regional defaults.',
    ],
  },
};
