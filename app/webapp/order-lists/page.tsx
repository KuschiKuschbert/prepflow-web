'use client';

import { Icon } from '@/components/ui/Icon';
import { LoadingSkeleton, PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { ResponsivePageContainer } from '@/components/ui/ResponsivePageContainer';
import { cacheData, getCachedData, prefetchApi } from '@/lib/cache/data-cache';
import { logger } from '@/lib/logger';
import { ClipboardCheck, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { PageHeader } from '../components/static/PageHeader';
import { WeatherOperationalTip } from '../components/WeatherOperationalTip';

// Lazy load order list components to reduce initial bundle size
const MenuIngredientsTable = dynamic(
  () =>
    import('./components/MenuIngredientsTable').then(mod => ({
      default: mod.MenuIngredientsTable,
    })),
  {
    ssr: false,
    loading: () => <PageSkeleton />,
  },
);

interface Menu {
  id: string;
  menu_name: string;
  description?: string;
  created_at: string;
  items_count?: number;
}

interface Ingredient {
  id: string;
  ingredient_name: string;
  brand?: string;
  pack_size?: string;
  pack_size_unit?: string;
  pack_price?: number;
  cost_per_unit: number;
  unit?: string;
  storage?: string;
  category?: string;
  par_level?: number;
  reorder_point?: number;
  par_unit?: string;
}

interface MenuIngredientsResponse {
  success: boolean;
  menuName: string;
  menuId: string;
  ingredients: Ingredient[];
  groupedIngredients: Record<string, Ingredient[]>;
  sortBy: string;
}

export default function OrderListsPage() {
  // Initialize with empty array to avoid hydration mismatch
  // Cached data will be loaded in useEffect after mount
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [ingredientsData, setIngredientsData] = useState<MenuIngredientsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'storage' | 'name' | 'category'>('storage');

  // Prefetch APIs on mount
  useEffect(() => {
    prefetchApi('/api/menus');
  }, []);

  // Fetch menus on mount
  useEffect(() => {
    // Load cached data for instant display (client-only)
    const cachedMenus = getCachedData<Menu[]>('order_lists_menus');
    if (cachedMenus && cachedMenus.length > 0) {
      setMenus(cachedMenus);
      setLoading(false);

      // Default to most recently created menu
      const mostRecent = cachedMenus.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];
      setSelectedMenuId(mostRecent.id);
    }

    // Fetch fresh data
    fetchMenus();
  }, []);

  // Fetch ingredients when menu or sort changes
  useEffect(() => {
    if (selectedMenuId) {
      fetchMenuIngredients(selectedMenuId, sortBy);
    }
  }, [selectedMenuId, sortBy]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menus');
      const result = await response.json();

      if (result.success && result.menus) {
        const menusList = result.menus as Menu[];
        setMenus(menusList);
        cacheData('order_lists_menus', menusList);

        // Default to most recently created menu
        if (menusList.length > 0) {
          const mostRecent = menusList.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )[0];
          setSelectedMenuId(mostRecent.id);
        }
      } else {
        setError(result.message || 'Failed to fetch menus');
      }
    } catch (err) {
      logger.error('Failed to fetch menus:', err);
      setError('Failed to fetch menus. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuIngredients = async (menuId: string, sort: string) => {
    try {
      setLoadingIngredients(true);
      setError(null);
      const response = await fetch(`/api/menus/${menuId}/ingredients?sortBy=${sort}`);
      const result = await response.json();

      if (result.success) {
        setIngredientsData(result);
        setError(null);
        // Cache ingredients data for this menu
        cacheData(`order_lists_ingredients_${menuId}_${sort}`, result);
      } else {
        const errorMsg = result.message || result.error || 'Failed to fetch menu ingredients';
        setError(errorMsg);
        setIngredientsData(null);
        logger.error('Failed to fetch menu ingredients:', result);
      }
    } catch (err) {
      logger.error('Failed to fetch menu ingredients:', err);
      setError('Failed to fetch menu ingredients. Please check your connection and try again.');
      setIngredientsData(null);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleMenuChange = (menuId: string) => {
    setSelectedMenuId(menuId);
  };

  const handleSortChange = (sort: 'storage' | 'name' | 'category') => {
    setSortBy(sort);
  };

  if (loading) {
    return (
      <ResponsivePageContainer>
        <div className="min-h-screen bg-transparent py-8 text-[var(--foreground)]">
          <LoadingSkeleton variant="stats" height="64px" />
          <div className="mt-6">
            <LoadingSkeleton variant="table" />
          </div>
        </div>
      </ResponsivePageContainer>
    );
  }

  return (
    <ResponsivePageContainer>
      <div className="min-h-screen bg-transparent py-8 text-[var(--foreground)]">
        <PageHeader
          title="Order Lists"
          subtitle="Generate ingredient order lists from your menus"
          icon={ClipboardCheck}
          showLogo={true}
        />

        <WeatherOperationalTip />

        {PAGE_TIPS_CONFIG['order-lists'] && (
          <div className="mb-6">
            <PageTipsCard config={PAGE_TIPS_CONFIG['order-lists']} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 p-4">
            <p className="font-semibold text-[var(--color-error)]">{error}</p>
            {error.includes('column') && (
              <p className="mt-2 text-sm text-red-300">
                This usually means your data structure needs to be updated. Check the server logs
                for more details.
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="tablet:flex-row tablet:items-center tablet:justify-between mb-6 flex flex-col gap-4 print:hidden">
          {/* Menu Selector */}
          <div className="flex-1">
            <label
              htmlFor="menu-select"
              className="mb-2 block text-sm font-medium text-[var(--foreground-secondary)]"
            >
              Select Menu
            </label>
            <select
              id="menu-select"
              value={selectedMenuId}
              onChange={e => handleMenuChange(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            >
              {menus.length === 0 ? (
                <option value="">No menus available</option>
              ) : (
                menus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.menu_name} {menu.items_count ? `(${menu.items_count} items)` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="tablet:max-w-xs flex-1">
            <label
              htmlFor="sort-select"
              className="mb-2 block text-sm font-medium text-[var(--foreground-secondary)]"
            >
              Sort By
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={e => handleSortChange(e.target.value as 'storage' | 'name' | 'category')}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            >
              <option value="storage">Storage Location</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Ingredients Table */}
        {loadingIngredients ? (
          <div className="mt-6">
            <LoadingSkeleton variant="table" />
          </div>
        ) : ingredientsData ? (
          <MenuIngredientsTable
            menuName={ingredientsData.menuName}
            groupedIngredients={ingredientsData.groupedIngredients}
            sortBy={ingredientsData.sortBy}
          />
        ) : menus.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20">
              <Icon
                icon={ClipboardCheck}
                size="xl"
                className="text-[var(--primary)]"
                aria-hidden={true}
              />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--button-active-text)]">
              No Menus Found
            </h3>
            <p className="mb-6 text-[var(--foreground-muted)]">
              Create a menu in Menu Builder to generate order lists
            </p>
            <a
              href="/webapp/menu-builder"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#29E7CD] to-[#D925C7] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Icon icon={Plus} size="sm" aria-hidden /> Open Menu Builder
            </a>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[var(--foreground-muted)]">Select a menu to view ingredients</p>
          </div>
        )}
      </div>
    </ResponsivePageContainer>
  );
}
