# FAQ Section Implementation

## Overview
Added a comprehensive FAQ section to the client portal with video tutorials and searchable frequently asked questions.

## What Was Added

### 1. New FAQ Page (`/client/faq`)
**Location:** `src/app/(client)/client/faq/page.tsx`

**Features:**
- **Two-tab interface:**
  - **Video Tutorials Tab:** Embedded Google Drive videos with descriptions
  - **FAQs Tab:** Accordion-style questions with search and category filtering

- **Video Tutorials Section:**
  - 5 placeholder video tutorials (ready for actual Google Drive video IDs)
  - Topics covered:
    1. Getting Started with Your Diet Plan
    2. How to Log Daily Meals
    3. Weekly Check-in Process
    4. Understanding Your Workout Plan
    5. Tracking Body Measurements
  - Responsive video embeds using Google Drive preview
  - Clean card-based layout with video icons

- **FAQs Section:**
  - 21 comprehensive questions covering all aspects of the platform
  - Categories: Diet Plan, Daily Check-in, Weekly Check-in, Workout, Measurements, Habits, Progress, General
  - Search functionality to filter questions
  - Category filter chips for quick navigation
  - Accordion-style expandable answers
  - Visual feedback with gold highlighting on active items

### 2. Navigation Update
**Location:** `src/components/client/navbar.tsx`

- Added "Help" tab to the bottom navigation bar
- Icon: HelpCircle from lucide-react
- Shortened "Diet Plan" to "Diet" to accommodate the new tab
- Maintains consistent styling with other navigation items

### 3. Styling Enhancements
**Location:** `src/app/globals.css`

- Added `.scrollbar-hide` utility class for horizontal scrolling category filters
- Maintains consistency with existing glass effects and gold theme

## Design Patterns Followed

✅ **Suspense boundary** with inner component pattern  
✅ **Demo mode support** via `useIsDemo()` hook  
✅ **Consistent card-based layout** using `<Card>` component  
✅ **Gold theme** with proper color usage  
✅ **Mobile-first responsive design**  
✅ **Proper TypeScript typing** for all data structures  
✅ **"use client"** directive for interactive components  
✅ **Consistent input styling** matching other forms  
✅ **Loading spinner** pattern (in Suspense fallback)

## Data Structure

### Video Tutorial Interface
```typescript
interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  driveId: string; // Google Drive file ID
  thumbnail?: string;
}
```

### FAQ Item Interface
```typescript
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  videoId?: string; // Optional link to related video
}
```

## How to Update Video IDs

The video tutorials currently use placeholder Google Drive IDs. To update with actual videos:

1. Upload videos to Google Drive
2. Get the shareable link for each video
3. Extract the file ID from the link (format: `https://drive.google.com/file/d/FILE_ID/view`)
4. Update the `driveId` field in the `videoTutorials` array in `src/app/(client)/client/faq/page.tsx`

Example:
```typescript
{
  id: "v1",
  title: "Getting Started with Your Diet Plan",
  description: "Learn how to navigate and understand your personalized diet plan",
  driveId: "YOUR_ACTUAL_DRIVE_FILE_ID_HERE",
}
```

## FAQ Categories

The FAQ section includes 8 categories:
1. **All** - Shows all questions
2. **Diet Plan** - Questions about viewing and following diet plans
3. **Daily Check-in** - Questions about logging daily meals
4. **Weekly Check-in** - Questions about submitting weekly progress
5. **Workout** - Questions about workout plans and exercises
6. **Measurements** - Questions about tracking body measurements
7. **Habits** - Questions about daily habit tracking
8. **Progress** - Questions about seeing and understanding progress
9. **General** - General platform questions

## Future Enhancements

Potential improvements for future iterations:

1. **Database Integration:**
   - Move FAQ data to Supabase database
   - Allow coach to add/edit FAQs via admin panel
   - Track which FAQs are most viewed

2. **Video Management:**
   - Admin interface for uploading and managing videos
   - Video thumbnails and duration display
   - Video watch progress tracking

3. **Search Improvements:**
   - Highlight search terms in results
   - Search suggestions/autocomplete
   - Recently searched questions

4. **User Engagement:**
   - "Was this helpful?" feedback buttons
   - Related questions suggestions
   - Contact coach button for unanswered questions

5. **Analytics:**
   - Track most searched questions
   - Identify gaps in documentation
   - Monitor video completion rates

## Testing Checklist

- [ ] Navigate to `/client/faq` (or `/client/faq?demo=true` for demo mode)
- [ ] Switch between Video Tutorials and FAQs tabs
- [ ] Test video playback (once actual video IDs are added)
- [ ] Search for questions using the search bar
- [ ] Filter questions by category
- [ ] Expand/collapse FAQ items
- [ ] Verify mobile responsiveness
- [ ] Check navigation from bottom nav bar
- [ ] Test with actual client data (not demo mode)

## Files Modified

1. **Created:**
   - `src/app/(client)/client/faq/page.tsx` - Main FAQ page component

2. **Modified:**
   - `src/components/client/navbar.tsx` - Added FAQ navigation item
   - `src/app/globals.css` - Added scrollbar-hide utility class

## Branch Information

- **Branch name:** `feature/add-faq-section`
- **Base branch:** main
- **Status:** Ready for review

## Notes

- All 21 FAQ questions are production-ready and cover common client questions
- Video embeds use Google Drive's preview feature for seamless playback
- The design follows the existing platform patterns and maintains visual consistency
- No database changes required - all data is currently static (can be migrated to DB later)
- Demo mode is supported (though FAQ content is the same in demo and live modes)
