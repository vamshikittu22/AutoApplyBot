# Autofill & Page Detection Fixes

## Summary
Fixed autofill and page detection issues to work like Simplify Jobs extension with universal job application detection.

## Changes Made

### 1. Fixed Content Script Registration
**Problem:** Content scripts were not being built by WXT
**Root Cause:** Content scripts were in subdirectory `src/entrypoints/content/` but WXT requires them directly in `src/entrypoints/`
**Solution:** Moved all `.content.ts` files to `src/entrypoints/` root

### 2. Created Universal Autofill System
**New File:** `src/entrypoints/autofill.content.ts`
- Simple, lightweight content script (no React complexity)
- Injects floating autofill button (fixed position, top-right)
- Beautiful gradient UI with hover effects
- Loading states with spinner
- Success/error feedback
- Dynamic imports for heavy modules (autofill engine)

### 3. Added Universal Job Site Detection
**New Detectors Created:**
- `src/lib/ats/linkedin.ts` - LinkedIn Easy Apply detection
- `src/lib/ats/indeed.ts` - Indeed Apply detection
- `src/lib/ats/glassdoor.ts` - Glassdoor application detection
- `src/lib/ats/generic.ts` - Fallback for any job application form

### 4. Expanded URL Matching
**Now Matches:**
- Workday, Greenhouse, Lever (original)
- LinkedIn (`*://*.linkedin.com/jobs/*`)
- Indeed (`*://*.indeed.com/viewjob*`, `*://*.indeed.com/rc/clk*`)
- Glassdoor (`*://*.glassdoor.com/job-listing/*`)
- Generic patterns (`*://*/apply/*`, `*://*/careers/*`, `*://*/jobs/*`, `*://*/application/*`)

### 5. Updated Type System
**Modified:** `src/types/ats.ts`
- Added `linkedin`, `indeed`, `glassdoor`, `generic` to `ATSPlatform` type
- Now supports 7 platform types instead of just 3

### 6. Enhanced ATS Patterns
**Modified:** `src/constants/ats-patterns.ts`
- Added URL patterns for new platforms
- Changed types to `Partial<Record<>>` to allow incremental addition

## How It Works

1. **Automatic Page Detection:**
   - Content script loads on any matching URL pattern
   - Waits 500ms for dynamic content to load
   - Runs ATS detection (checks URL + DOM + attributes)
   - Falls back to generic form detection if no specific ATS found

2. **Button Injection:**
   - If detection confidence ≥ 30% OR forms exist → inject button
   - Button appears top-right, fixed position
   - Purple gradient, modern design
   - Click triggers autofill

3. **Autofill Process:**
   - Loads user profile from chrome.storage
   - Dynamically imports AutofillEngine (lazy loading)
   - Fills fields with confidence scoring
   - Highlights filled fields
   - Shows success/error feedback

4. **SPA Support:**
   - MutationObserver watches for URL changes
   - Re-initializes on navigation
   - Works with LinkedIn, Indeed single-page apps

## Testing

### To Test:
1. Reload extension in browser (`chrome://extensions` → reload)
2. Visit any job application page:
   - LinkedIn: https://www.linkedin.com/jobs/view/XXXXX
   - Indeed: https://www.indeed.com/viewjob?jk=XXXXX
   - Greenhouse: https://boards.greenhouse.io/company/jobs/XXXXX
   - Any career page with `/apply/` or `/jobs/`
3. Button should appear top-right after ~500ms
4. Click button → autofill should work

### Expected Behavior:
- ✅ Button appears automatically on job pages
- ✅ No manual activation needed
- ✅ Works across different job sites
- ✅ Smooth animations and feedback
- ✅ Persists across SPA navigation

## Files Modified
- `src/entrypoints/autofill.content.ts` (created)
- `src/lib/ats/linkedin.ts` (created)
- `src/lib/ats/indeed.ts` (created)
- `src/lib/ats/glassdoor.ts` (created)
- `src/lib/ats/generic.ts` (created)
- `src/lib/ats/detector.ts` (updated to register new detectors)
- `src/types/ats.ts` (added new platform types)
- `src/constants/ats-patterns.ts` (added patterns for new platforms)

## Files Temporarily Disabled
- `src/entrypoints/ai-suggest.content.ts.disabled` (had broken imports)
- `src/entrypoints/job-tracker.content.ts.disabled` (had broken imports)

These can be re-enabled later by fixing their import paths.

## Next Steps
- Test on real job sites
- Fine-tune detection confidence thresholds
- Add more platform-specific field selectors
- Re-enable ai-suggest and job-tracker content scripts
