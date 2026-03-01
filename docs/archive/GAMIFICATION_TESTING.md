# Gamification Testing Guide

## Quick Test Checklist

### ✅ Build Status

- [x] TypeScript compilation passes
- [x] No linting errors
- [x] All imports resolve correctly

### 🧪 Manual Testing Steps

#### 1. **Achievement Tracking**

**Test First Recipe Achievement:**

1. Navigate to `/webapp/recipes`
2. Click "New Recipe" and create a recipe
3. ✅ Should see achievement toast: "First Recipe" unlocked
4. ✅ Confetti should trigger

**Test Ten Ingredients Achievement:**

1. Navigate to `/webapp/ingredients`
2. Add 10 ingredients (one by one)
3. ✅ On the 10th ingredient, should see achievement toast: "Ten Ingredients" unlocked

**Test First Dish Achievement:**

1. Navigate to `/webapp/dish-builder`
2. Create a new dish
3. ✅ Should see achievement toast: "First Dish" unlocked

**Test Hundred Saves Achievement:**

1. Make 100 save operations (can be across different pages)
2. ✅ On the 100th save, should see achievement toast: "Hundred Saves" unlocked

#### 2. **Milestone Celebrations**

**Test Recipe Collection Milestone:**

1. Create 10 recipes total
2. ✅ Should see milestone toast: "Recipe Collection - Created 10 recipes"
3. ✅ Subtle confetti should trigger

**Test Stock Master Milestone:**

1. Add 50 ingredients total
2. ✅ Should see milestone toast: "Stock Master - Added 50 ingredients"
3. ✅ Subtle confetti should trigger

**Test Save Master Milestone:**

1. Save 100 times total
2. ✅ Should see milestone toast: "Save Master - Saved 100 times"
3. ✅ Subtle confetti should trigger

**Test Achievement Milestones:**

1. Unlock your first achievement
2. ✅ Should see milestone toast: "First Achievement - Unlocked your first achievement"
3. Unlock 5 achievements (halfway)
4. ✅ Should see milestone toast: "Halfway There - Unlocked 50% of achievements"
5. Unlock all 10 achievements
6. ✅ Should see milestone toast: "Achievement Master - Unlocked all achievements"

#### 3. **NavbarStats Component**

**Test Click to Open:**

1. Click on the stats badges in the navbar (🍅🧾🔥)
2. ✅ Should open AchievementsDropdown modal

**Test Achievement Badge:**

1. Unlock at least one achievement
2. ✅ Should see 🏆 badge with count in navbar
3. ✅ Badge should show number of unlocked achievements

**Test Streak Indicator:**

1. Use the app for multiple days in a row
2. ✅ Should see 🔥 badge with streak days
3. ✅ Streak should persist across sessions

**Test Arcade Stats Display:**

1. Play arcade games (tomato toss, catch docket, kitchen fire)
2. ✅ Stats should update in navbar
3. ✅ Stats should persist in sessionStorage

#### 4. **AchievementsDropdown**

**Test Opening:**

1. Press `Shift+A` or long-press logo for 2 seconds
2. ✅ Should open AchievementsDropdown modal

**Test Tabs:**

1. Click "Arcade Stats" tab
2. ✅ Should show tomatoes, dockets, fires counts
3. Click "Achievements" tab
4. ✅ Should show all achievements with progress

**Test Achievement Display:**

1. View achievements tab
2. ✅ Unlocked achievements should have checkmark
3. ✅ Locked achievements should show progress bar
4. ✅ Achievements should be grouped by category

**Test Progress Bar:**

1. View achievements tab
2. ✅ Overall progress bar should show percentage
3. ✅ Individual achievement progress bars should show progress

#### 5. **Arcade Games**

**Test Tomato Toss:**

1. Click logo 9 times quickly
2. ✅ Should open Tomato Toss game
3. Throw tomatoes
4. ✅ Stats should update
5. ✅ Confetti should trigger at 10, 25, 50, 100 throws

**Test Catch The Docket:**

1. Trigger loading screen (navigate between pages)
2. ✅ Should see docket catching game
3. Catch dockets
4. ✅ Stats should update

**Test Kitchen Fire:**

1. Trigger an error page
2. ✅ Should see kitchen fire game
3. Extinguish fires
4. ✅ Stats should update

#### 6. **Event System**

**Test Browser Console:**

1. Open browser DevTools console
2. Perform actions (create recipe, add ingredient, etc.)
3. ✅ Should see event dispatches:
   - `personality:achievement` when achievement unlocked
   - `gamification:milestone` when milestone reached
   - `arcade:statsUpdated` when stats change

#### 7. **Storage**

**Test LocalStorage:**

1. Open DevTools → Application → Local Storage
2. ✅ Should see:
   - `prepflow_tomatoes_thrown` (arcade stats)
   - `prepflow_dockets_total` (arcade stats)
   - `prepflow_fires_extinguished` (arcade stats)
   - `prepflow-achievements` (unlocked achievements)
   - `prepflow-achievement-stats` (achievement statistics)
   - `prepflow-milestones-shown` (shown milestones)

**Test SessionStorage:**

1. Open DevTools → Application → Session Storage
2. ✅ Should see session-specific arcade stats

#### 8. **Integration Tests**

**Test Achievement + Milestone Together:**

1. Create your first recipe
2. ✅ Should see achievement toast AND milestone toast (if first achievement)

**Test Stats Persistence:**

1. Play arcade games
2. Refresh page
3. ✅ Stats should persist (global stats in localStorage)
4. ✅ Session stats should reset (sessionStorage)

**Test Multiple Achievements:**

1. Unlock multiple achievements quickly
2. ✅ Each should show toast sequentially
3. ✅ No duplicate toasts

## Browser Console Test Commands

Run these in the browser console to manually test:

```javascript
// Check achievement stats
JSON.parse(localStorage.getItem('prepflow-achievement-stats'));

// Check unlocked achievements
JSON.parse(localStorage.getItem('prepflow-achievements'));

// Check shown milestones
JSON.parse(localStorage.getItem('prepflow-milestones-shown'));

// Manually trigger achievement (for testing)
window.dispatchEvent(
  new CustomEvent('personality:achievement', {
    detail: {
      achievement: {
        id: 'TEST',
        name: 'Test Achievement',
        description: 'This is a test',
        icon: '🧪',
        unlockedAt: Date.now(),
      },
    },
  }),
);

// Manually trigger milestone (for testing)
window.dispatchEvent(
  new CustomEvent('gamification:milestone', {
    detail: {
      milestone: {
        id: 'test-milestone',
        type: 'usage',
        name: 'Test Milestone',
        description: 'This is a test milestone',
        threshold: 1,
        icon: '🎯',
      },
    },
  }),
);
```

## Expected Behavior

### ✅ Success Indicators

- All achievements unlock correctly
- Milestones trigger at correct thresholds
- Confetti animations are subtle (not overwhelming)
- Toast notifications appear and auto-dismiss
- Stats persist across page refreshes
- NavbarStats updates in real-time
- AchievementsDropdown shows correct data
- No console errors

### ❌ Failure Indicators

- Achievements don't unlock
- Milestones trigger multiple times
- Confetti is too intense or doesn't trigger
- Toast notifications don't appear
- Stats don't persist
- NavbarStats doesn't update
- AchievementsDropdown shows incorrect data
- Console errors present

## Troubleshooting

### Achievements Not Unlocking

1. Check browser console for errors
2. Verify personality system is enabled (check settings)
3. Check localStorage for achievement stats
4. Verify tracking functions are being called

### Milestones Not Triggering

1. Check if milestone was already shown (localStorage)
2. Verify milestone threshold is correct
3. Check browser console for errors
4. Verify milestone check functions are being called

### Stats Not Updating

1. Check sessionStorage/localStorage directly
2. Verify event listeners are attached
3. Check browser console for errors
4. Verify stats functions are being called

### Toast Not Appearing

1. Check if component is mounted (MilestoneToast, AchievementToast)
2. Verify event is being dispatched
3. Check browser console for errors
4. Verify personality system is enabled

## Next Steps

After testing, if everything works:

1. ✅ Mark testing complete
2. ✅ Document any issues found
3. ✅ Proceed with remaining gamification features
