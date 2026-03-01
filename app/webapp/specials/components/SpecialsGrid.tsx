'use client';

import { Icon } from '@/components/ui/Icon';
import { ChefHat } from 'lucide-react';
import React from 'react';
import { APIRecipe } from '../utils';
import { RecipeCard } from './RecipeCard';
import { RecipeCardSkeleton } from './RecipeCardSkeleton';

interface SpecialsGridProps {
  loading: boolean;
  recipes: APIRecipe[];
  ingredients: string[];
  inputInternal: string;
  hasMore: boolean;
  loadMore: () => void;
  onRecipeClick: (recipe: APIRecipe) => void;
  observerRef?: React.Ref<HTMLDivElement>;
  inView?: boolean;
}

export function SpecialsGrid({
  loading,
  recipes,
  ingredients,
  inputInternal,
  hasMore,
  loadMore,
  onRecipeClick,
  observerRef,
  inView,
}: SpecialsGridProps) {
  if (loading && recipes.length === 0) {
    return (
      <div className="tablet:grid-cols-2 desktop:grid-cols-3 large-desktop:grid-cols-4 large-desktop:gap-8 grid grid-cols-1 gap-6 px-4 pb-12 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (recipes.length > 0) {
    return (
      <div className="tablet:grid-cols-2 desktop:grid-cols-3 large-desktop:grid-cols-4 large-desktop:gap-8 grid grid-cols-1 gap-6 px-4 pb-12 xl:grid-cols-5">
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            searchIngredients={ingredients.length > 0 ? ingredients : [inputInternal]}
            onClick={onRecipeClick}
          />
        ))}

        {hasMore && (
          <div ref={observerRef} className="col-span-full flex justify-center pt-8">
            {inView && loading && (
              <div className="flex animate-pulse items-center gap-2 text-white/50">
                <div className="h-2 w-2 rounded-full bg-white/50" />
                <div className="animation-delay-200 h-2 w-2 rounded-full bg-white/50" />
                <div className="animation-delay-400 h-2 w-2 rounded-full bg-white/50" />
              </div>
            )}
            {!inView && (
              <button
                onClick={loadMore}
                className="text-sm text-white/30 transition-colors hover:text-white/70"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Empty State
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-white/5 p-4">
        <Icon icon={ChefHat} size="xl" className="text-[var(--primary)]" aria-hidden />
      </div>
      <p className="text-xl font-medium text-white/60">Our chefs are stumped!</p>
      <p className="mt-2 max-w-sm text-sm text-white/40">
        We couldn&apos;t find any recipes matching your criteria. Try loosening the &quot;Strict
        Match&quot; filter or adding more ingredients.
      </p>
    </div>
  );
}
