# PARQ Inspo Section - Implementation Documentation

## Overview

The Inspo tab has been rebuilt into a comprehensive PARQ (Prompts, Affirmations, Rituals, Quotes) hub with community-driven features.

## Key Features

### 1. PARQ Deck
- **Segmented Type Selector**: Toggle between Prompts, Affirmations, Rituals, and Quotes
- **Interactive Card Carousel**: Swipe through curated PARQ items with beautiful dark-mode styling
- **Save Functionality**: Bookmark favorite PARQ items for later
- **Theme Tags & Tone Tags**: Each item categorized with relevant themes and emotional tones

### 2. Sections Strip
Horizontally scrollable section chips with 14 categories:
- 📝 PARQ
- 🔥 Top Stories of the Week  
- 🤲 Weekly Curated Ideas
- 🍷 Date Night
- 🎁 Gift Giving
- 🪢 Asking to Be Official
- 🍽️ Acts of Service
- 🛫 Romantic Getaways
- 💐 Just Because
- 💌 Tell Your Story (UGC entry point)
- 🍁 Seasonal/Holiday (Coming Soon)
- 🗺️ Long Distance (Coming Soon)
- 🎞️ Animated Series (Coming Soon)
- 🐶 Ask Sparky (Coming Soon)

### 3. User-Generated Content (UGC)
- **Submission Flow**: "Tell Your Story" opens a form for users to share ideas
- **Moderation System**: Posts have pending/approved/rejected status
- **Rich Metadata**: Title, body, action spark, tags, category selection

### 4. Saved Items
- Persistent save state for PARQ items
- Count displayed in main Inspo screen
- Separate saved items screen (stub created)

## Data Model

### New Types (`types/index.ts`)
- `ParqItem`: Curated prompts, affirmations, rituals, quotes
- `InspoSection`: Section configuration (label, emoji, comingSoon status)
- `InspoPost`: Community posts with engagement metrics
- `InspoReaction`: User likes/reactions
- `InspoComment`: User comments on posts
- `InspoBookmark`: Saved posts

### Mock Data (`constants/parq-data.ts`)
- **SEED_PARQ_ITEMS**: 12 curated PARQ items across all 4 types
- **INSPO_SECTIONS**: 14 section configurations
- **SEED_INSPO_POSTS**: 10 example community posts with varied sources (user/curated)

### Store Updates (`store/appStore.ts`)
New state management functions:
- `getParqItems()`: Fetch PARQ deck items
- `getPosts()`: Get approved posts
- `getPostsBySection()`: Filter posts by section
- `toggleParqSave()`: Save/unsave PARQ items
- `togglePostLike()`: Like/unlike posts
- `togglePostBookmark()`: Bookmark posts
- `addPostComment()`: Add comments
- `submitPost()`: Submit UGC

## File Structure

```
app/
├── (tabs)/
│   └── inspo.tsx                  # Main Inspo screen with PARQ deck + sections
├── inspo/
│   ├── submit-story.tsx           # UGC submission form
│   ├── saved.tsx                  # Saved items view (stub)
│   └── section/
│       └── [id].tsx               # Section feed (stub)
constants/
└── parq-data.ts                   # Mock data for PARQ system
types/
└── index.ts                       # Extended with PARQ types
store/
└── appStore.ts                    # Updated with PARQ state management
```

## UI/UX Highlights

### Dark Mode Design
- Consistent with app's ChatGPT-inspired dark theme
- Color-coded type indicators:
  - **Prompts**: Blue (#60A5FA)
  - **Affirmations**: Pink (#F472B6)
  - **Rituals**: Amber (#FBBF24)
  - **Quotes**: Purple (#A78BFA)

### Interactions
- Haptic feedback on all touch interactions
- Smooth card transitions
- Type-specific color glows on active card
- Disabled state for "Coming Soon" sections

### Accessibility
- Clear visual hierarchy
- High contrast text
- Readable font sizes
- Touch-friendly tap targets

## Next Steps (To Be Implemented)

### High Priority
1. **Section Feed Screen** (`app/inspo/section/[id].tsx`)
   - Display filtered posts by section
   - Engagement controls (like, comment, share, bookmark)
   - Infinite scroll/pagination
   - Post detail view

2. **Saved Items Screen** (`app/inspo/saved.tsx`)
   - Grid/list view of saved PARQ items
   - Saved posts from community
   - Filter/sort options

### Medium Priority
3. **Comments System**
   - Comment thread UI
   - Reply functionality
   - Comment moderation

4. **Post Engagement**
   - Real-time like counts
   - Share sheet integration
   - Report/flag system

### Future Enhancements
5. **Premium Features**
   - Gate certain sections behind Spark'd Plus
   - Unlock additional PARQ packs
   - Early access to seasonal content

6. **AI Integration**
   - Generate personalized PARQ items based on user profile
   - Suggest relevant posts based on interaction history
   - Auto-categorize UGC submissions

7. **Analytics**
   - Track engagement metrics
   - Popular sections/posts
   - User interaction patterns

## Technical Notes

### Router Type Assertions
Due to strict Expo Router typing, new routes require `as any` type assertions:
```typescript
router.push('/inspo/submit-story' as any);
```
This is safe and will be resolved once routes are registered in the router.

### Web Compatibility
- All PARQ features work on React Native Web
- Haptics gracefully degrade on web platform
- Responsive horizontal scrolling for sections strip

### Performance Considerations
- PARQ items loaded from store (constant time lookup)
- Posts filtered in-memory (consider pagination for 100+ posts)
- Saved state persisted with Zustand + AsyncStorage

## Testing Checklist

- [x] PARQ deck toggles between types
- [x] Save/unsave PARQ items
- [x] Section chips navigate correctly
- [x] UGC submission form validates input
- [x] Submitted posts have pending status
- [ ] Section feed displays filtered posts
- [ ] Like/bookmark interactions work
- [ ] Comments can be added/deleted
- [ ] Saved items screen displays all saved content

## Design Decisions

1. **Moderation-First UGC**: All user submissions require approval to maintain community quality
2. **Separate PARQ and Posts**: PARQ items are curated/AI-generated, posts are community-driven stories
3. **Section-Based Organization**: Clear categorization makes content discoverable
4. **Mobile-First Interactions**: Haptics, swipe gestures, thumb-friendly layout

## Known Limitations

1. Section feed and saved items screens are currently stubs
2. No backend integration (all state is local)
3. No image upload for UGC posts
4. Comments system UI not implemented
5. No search functionality within sections

---

**Last Updated**: January 2025  
**Version**: 1.0 - Initial PARQ rebuild
