'use client';

import React from 'react';
import { useTranslation } from '../lib/useTranslation';

interface LanguageSwitcherProps {
  className?: string;
  showFlag?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LanguageSwitcher({
  className = '',
  showFlag = true,
  showName = true,
  size = 'md',
}: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage, getCurrentLanguageInfo, getAvailableLanguages } =
    useTranslation();

  const _currentLangInfo = getCurrentLanguageInfo();
  const availableLangs = getAvailableLanguages();

  const sizeClasses = {
    sm: 'py-1 pl-2 text-xs',
    md: 'py-2 pl-3 text-fluid-sm',
    lg: 'py-3 pl-4 text-fluid-base',
  };

  const paddingRightBySize = {
    sm: '1.75rem',
    md: '2.5rem',
    lg: '2.5rem',
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={currentLanguage}
        onChange={e => changeLanguage(e.target.value)}
        className={`min-w-0 ${sizeClasses[size]} cursor-pointer appearance-none rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] transition-all duration-200 hover:border-[var(--primary)]/50 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)] focus:outline-none`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.35rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: size === 'sm' ? '1em 1em' : '1.5em 1.5em',
          paddingRight: paddingRightBySize[size],
        }}
      >
        {availableLangs.map(lang => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-[var(--muted)] text-[var(--foreground)]"
          >
            {showFlag && lang.flag} {showName && lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
