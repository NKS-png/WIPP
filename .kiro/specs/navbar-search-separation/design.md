# Design Document: Navbar Search Separation

## Overview

This design transforms the current unified search dropdown into a dual-container search interface that separates users/projects from communities/posts. The enhancement maintains all existing functionality while improving content discoverability through visual separation and dedicated result containers.

The design leverages the existing search API and UnifiedSearch component architecture, requiring only frontend modifications to group and display results in separate containers. This approach ensures backward compatibility while providing a more organized search experience.

## Architecture

### Component Structure

The enhanced search system builds upon the existing UnifiedSearch component with the following architectural changes:

```
UnifiedSearch (Enhanced)
├── SearchInput (unchanged)
├── SearchResultsContainer (new wrapper)
│   ├── UserProjectsBox
│   │   ├── BoxHeader ("Users & Projects")
│   │   ├── UserResults (grouped)
│   │   ├── ProjectResults (grouped)
│   │   └── EmptyState (box-specific)
│   └── CommunityPostsBox
│       ├── BoxHeader ("Communities & Posts")
│       ├── CommunityResults (grouped)
│       ├── PostResults (grouped)
│       └── EmptyState (box-specific)
└── LoadingStates (distributed across boxes)
```

### Data Flow

1. **Search Input** → API request (unchanged)
2. **API Response** → Client-side result grouping (new)
3. **Grouped Results** → Distribution to appropriate boxes (new)
4. **Box Rendering** → Individual result display (enhanced)

### Responsive Behavior

- **Desktop (≥768px)**: Side-by-side layout with equal-width containers
- **Mobile (<768px)**: Stacked layout in full-screen overlay
- **Tablet**: Adaptive layout based on available space

## Components and Interfaces

### SearchResultsContainer

New wrapper component that manages the dual-box layout:

```typescript
interface SearchResultsContainer {
  results: SearchResult[];
  isLoading: boolean;
  isEmpty: boolean;
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
}
```

**Responsibilities:**
- Groups results by content type
- Manages box visibility logic
- Handles responsive layout switching
- Coordinates loading states

### SearchBox

Generic container for each result type group:

```typescript
interface SearchBox {
  title: string;
  results: SearchResult[];
  contentTypes: ContentType[];
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  className: string;
}
```

**Features:**
- Independent scrolling within each box
- Type-specific styling and icons
- Section headers for mixed content
- Individual empty states

### Enhanced SearchResult Interface

Extends existing interface with grouping metadata:

```typescript
interface EnhancedSearchResult extends SearchResult {
  displayGroup: 'users-projects' | 'communities-posts';
  priority: number; // For ordering within groups
}
```

## Data Models

### Result Grouping Logic

```typescript
interface ResultGroups {
  usersProjects: {
    users: SearchResult[];
    projects: SearchResult[];
  };
  communitiesPosts: {
    communities: SearchResult[];
    posts: SearchResult[];
  };
}

function groupSearchResults(results: SearchResult[]): ResultGroups {
  return results.reduce((groups, result) => {
    switch (result.type) {
      case 'user':
        groups.usersProjects.users.push(result);
        break;
      case 'project':
        groups.usersProjects.projects.push(result);
        break;
      case 'community':
        groups.communitiesPosts.communities.push(result);
        break;
      case 'post':
        groups.communitiesPosts.posts.push(result);
        break;
    }
    return groups;
  }, {
    usersProjects: { users: [], projects: [] },
    communitiesPosts: { communities: [], posts: [] }
  });
}
```

### Box Visibility Rules

```typescript
interface BoxVisibility {
  showUsersProjectsBox: boolean;
  showCommunitiesPostsBox: boolean;
}

function calculateBoxVisibility(groups: ResultGroups): BoxVisibility {
  const hasUsersOrProjects = 
    groups.usersProjects.users.length > 0 || 
    groups.usersProjects.projects.length > 0;
    
  const hasCommunitiesOrPosts = 
    groups.communitiesPosts.communities.length > 0 || 
    groups.communitiesPosts.posts.length > 0;

  return {
    showUsersProjectsBox: hasUsersOrProjects,
    showCommunitiesPostsBox: hasCommunitiesOrPosts
  };
}
```

## Layout Specifications

### Desktop Layout (≥768px)

```css
.search-results-container {
  display: flex;
  gap: 1rem;
  max-width: 56rem; /* 896px - accommodates both boxes */
}

.search-box {
  flex: 1;
  min-width: 0; /* Allows flex shrinking */
  max-height: 24rem;
  overflow-y: auto;
}

.search-box--single {
  max-width: 28rem; /* Original width when only one box */
}
```

### Mobile Layout (<768px)

```css
.search-results-container {
  flex-direction: column;
  gap: 0;
  height: 100vh;
}

.search-box {
  flex: 1;
  min-height: 0;
}
```

### Box Styling

Each search box has distinct visual identity:

```css
.search-box--users-projects {
  border-left: 3px solid #3b82f6; /* Blue accent */
}

.search-box--users-projects .search-box__header {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
}

.search-box--communities-posts {
  border-left: 3px solid #10b981; /* Green accent */
}

.search-box--communities-posts .search-box__header {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Dual Container Display
*For any* search input that triggers results, the system should display exactly two distinct result containers simultaneously
**Validates: Requirements 1.1**

### Property 2: Content Type Filtering
*For any* search results containing mixed content types, each box should display only its designated content types (users/projects in one box, communities/posts in the other)
**Validates: Requirements 1.2, 1.3, 2.1, 2.2**

### Property 3: Result Grouping and Distribution
*For any* search response, the system should correctly group results by type and distribute them to the appropriate boxes, with section headers separating different content types within the same box
**Validates: Requirements 2.3, 5.2, 5.3**

### Property 4: Box Visibility Logic
*For any* search results, a box should be visible if and only if it contains at least one result of its designated content types
**Validates: Requirements 2.4, 2.5**

### Property 5: Responsive Layout Behavior
*For any* viewport size, the system should display boxes side-by-side on desktop (≥768px) and stacked vertically on mobile (<768px)
**Validates: Requirements 1.4, 1.5, 4.1, 4.2, 7.1**

### Property 6: Box Header Labels
*For any* displayed search boxes, the user box should have header "Users & Projects" and the community box should have header "Communities & Posts"
**Validates: Requirements 3.1, 3.2**

### Property 7: Visual Distinction
*For any* displayed search boxes, each box should have distinct visual styling to differentiate between box types
**Validates: Requirements 3.3**

### Property 8: State Management Consistency
*For any* search state (loading, empty, error), both boxes should display appropriate state indicators independently
**Validates: Requirements 3.4, 3.5, 5.4, 5.5**

### Property 9: Mobile Scroll Control
*For any* mobile search session, activating search should prevent body scrolling, and closing search should restore normal scrolling behavior
**Validates: Requirements 4.3, 4.4**

### Property 10: Cross-Box Keyboard Navigation
*For any* search results displayed across both boxes, keyboard navigation should allow seamless movement between all result items regardless of which box they're in
**Validates: Requirements 4.5, 6.3**

### Property 11: API Compatibility
*For any* search request, the API should continue returning results in the existing format without modification
**Validates: Requirements 5.1**

### Property 12: Interaction Behavior Preservation
*For any* user interaction (debounce timing, click navigation, escape key, outside click), the system should maintain the same behavior as the current implementation
**Validates: Requirements 6.1, 6.2, 6.4, 6.5**

### Property 13: Layout Constraints
*For any* search box configuration (single or dual), the boxes should respect viewport boundaries, maintain appropriate sizing, and provide scrolling when content exceeds available space
**Validates: Requirements 7.2, 7.3, 7.4, 7.5**

## Error Handling

### Search API Errors

When the search API returns an error:
1. Display error states in both search boxes
2. Show retry options or fallback suggestions
3. Maintain search input state for user retry
4. Log errors for debugging without exposing sensitive information

### Network Connectivity Issues

During network interruptions:
1. Show loading states until timeout
2. Display offline indicators when appropriate
3. Cache recent searches for offline browsing
4. Gracefully degrade to cached results when available

### Malformed Search Results

When API returns unexpected data:
1. Validate result structure before rendering
2. Filter out malformed results silently
3. Log validation errors for monitoring
4. Display partial results when some data is valid

### Empty State Handling

For different empty scenarios:
- **No results found**: Show search suggestions and popular content links
- **Single box empty**: Hide empty box, expand remaining box
- **Both boxes empty**: Show unified empty state with exploration options
- **Loading timeout**: Show timeout message with retry option

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific result grouping scenarios
- Edge cases (empty results, single result types)
- Error conditions and fallback behaviors
- Integration points between existing and new components
- Mobile/desktop responsive breakpoints

**Property Tests** focus on:
- Universal properties that hold across all input combinations
- Result grouping logic with randomized search responses
- Layout behavior across different viewport sizes
- Keyboard navigation across varying result sets
- State management consistency across different scenarios

### Property-Based Testing Configuration

Using **fast-check** for TypeScript property-based testing:
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: **Feature: navbar-search-separation, Property {number}: {property_text}**

**Example Property Test Structure:**
```typescript
// Feature: navbar-search-separation, Property 2: Content Type Filtering
test('search results are filtered correctly by content type', () => {
  fc.assert(fc.property(
    searchResultsArbitrary,
    (results) => {
      const grouped = groupSearchResults(results);
      const userBox = renderUserBox(grouped.usersProjects);
      const communityBox = renderCommunityBox(grouped.communitiesPosts);
      
      // Verify user box only contains users and projects
      expect(userBox.results.every(r => 
        r.type === 'user' || r.type === 'project'
      )).toBe(true);
      
      // Verify community box only contains communities and posts
      expect(communityBox.results.every(r => 
        r.type === 'community' || r.type === 'post'
      )).toBe(true);
    }
  ));
});
```

### Integration Testing

**Component Integration:**
- Test interaction between SearchResultsContainer and SearchBox components
- Verify proper event handling and state synchronization
- Test responsive layout switching at breakpoints

**API Integration:**
- Verify existing search API continues to work unchanged
- Test error handling with various API response scenarios
- Validate result processing and grouping logic

**User Experience Integration:**
- Test complete search workflows from input to result selection
- Verify keyboard navigation across component boundaries
- Test mobile overlay behavior and scroll management

### Performance Testing

**Rendering Performance:**
- Measure rendering time with large result sets
- Test scroll performance within individual boxes
- Verify memory usage with frequent searches

**Search Responsiveness:**
- Maintain existing debounce timing
- Test concurrent search request handling
- Verify loading state transitions

The comprehensive testing approach ensures that the separated search interface maintains all existing functionality while reliably delivering the new dual-container experience across all supported devices and scenarios.