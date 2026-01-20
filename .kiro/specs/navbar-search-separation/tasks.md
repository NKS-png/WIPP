# Implementation Plan: Navbar Search Separation

## Overview

This implementation plan transforms the existing unified search dropdown into a dual-container interface that separates users/projects from communities/posts. The approach builds upon the current UnifiedSearch component, maintaining all existing functionality while adding the new separated layout through client-side result grouping and enhanced UI components.

## Tasks

- [ ] 1. Create result grouping utilities and interfaces
  - Create TypeScript interfaces for grouped search results
  - Implement result grouping logic functions
  - Add box visibility calculation utilities
  - _Requirements: 5.2, 5.3, 2.4, 2.5_

- [ ]* 1.1 Write property test for result grouping logic
  - **Property 2: Content Type Filtering**
  - **Property 3: Result Grouping and Distribution**
  - **Validates: Requirements 1.2, 1.3, 2.1, 2.2, 2.3, 5.2, 5.3**

- [ ] 2. Create SearchBox component
  - [ ] 2.1 Implement SearchBox component with header and styling
    - Create reusable SearchBox component for individual result containers
    - Add distinct headers and visual styling for each box type
    - Implement independent scrolling and empty states
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.2 Write property test for SearchBox styling and headers
    - **Property 6: Box Header Labels**
    - **Property 7: Visual Distinction**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ] 2.3 Add loading and error state handling to SearchBox
    - Implement independent loading indicators for each box
    - Add error state display with retry options
    - Handle empty state messaging specific to each box type
    - _Requirements: 3.5, 5.4, 5.5_

  - [ ]* 2.4 Write property test for SearchBox state management
    - **Property 8: State Management Consistency**
    - **Validates: Requirements 3.4, 3.5, 5.4, 5.5**

- [ ] 3. Create SearchResultsContainer component
  - [ ] 3.1 Implement dual-box container layout
    - Create wrapper component that manages both SearchBox instances
    - Implement responsive layout (side-by-side desktop, stacked mobile)
    - Add box visibility logic based on result content
    - _Requirements: 1.1, 1.4, 1.5, 4.1, 4.2_

  - [ ]* 3.2 Write property test for responsive layout behavior
    - **Property 5: Responsive Layout Behavior**
    - **Validates: Requirements 1.4, 1.5, 4.1, 4.2, 7.1**

  - [ ] 3.3 Implement box visibility and sizing logic
    - Add logic to show/hide boxes based on content availability
    - Implement single-box expansion when only one has results
    - Add viewport boundary constraints and max-width handling
    - _Requirements: 2.4, 2.5, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.4 Write property test for box visibility logic
    - **Property 4: Box Visibility Logic**
    - **Property 13: Layout Constraints**
    - **Validates: Requirements 2.4, 2.5, 7.2, 7.3, 7.4, 7.5**

- [ ] 4. Enhance UnifiedSearch component integration
  - [ ] 4.1 Modify UnifiedSearch to use new container components
    - Replace existing results rendering with SearchResultsContainer
    - Update result processing to use grouping utilities
    - Maintain existing search input and API integration
    - _Requirements: 5.1, 6.1, 6.2_

  - [ ]* 4.2 Write property test for API compatibility
    - **Property 11: API Compatibility**
    - **Validates: Requirements 5.1**

  - [ ] 4.3 Implement enhanced keyboard navigation
    - Add cross-box keyboard navigation support
    - Maintain existing arrow key, escape, and enter behaviors
    - Ensure focus management works across both containers
    - _Requirements: 4.5, 6.3, 6.4_

  - [ ]* 4.4 Write property test for keyboard navigation
    - **Property 10: Cross-Box Keyboard Navigation**
    - **Validates: Requirements 4.5, 6.3**

- [ ] 5. Add mobile-specific enhancements
  - [ ] 5.1 Implement mobile overlay scroll management
    - Add body scroll prevention when mobile search is active
    - Restore scroll behavior when search is closed
    - Ensure proper cleanup on component unmount
    - _Requirements: 4.3, 4.4_

  - [ ]* 5.2 Write property test for mobile scroll behavior
    - **Property 9: Mobile Scroll Control**
    - **Validates: Requirements 4.3, 4.4**

  - [ ] 5.3 Enhance mobile search overlay layout
    - Ensure stacked layout works properly on mobile
    - Add mobile-specific touch interactions
    - Verify full-screen overlay behavior
    - _Requirements: 4.1_

- [ ] 6. Update CSS styles and responsive design
  - [ ] 6.1 Add new CSS classes for dual-box layout
    - Create styles for SearchResultsContainer responsive layout
    - Add SearchBox styling with distinct visual identity
    - Implement mobile stacked layout styles
    - _Requirements: 1.4, 1.5, 3.3, 7.1_

  - [ ] 6.2 Enhance existing search result item styles
    - Ensure result items work properly in new box contexts
    - Maintain existing hover and focus states
    - Add section header styles for mixed content types
    - _Requirements: 2.3_

  - [ ] 6.3 Add dark mode support for new components
    - Extend existing dark mode styles to new components
    - Ensure proper contrast and accessibility
    - Test visual distinction in both light and dark modes
    - _Requirements: 3.3_

- [ ] 7. Checkpoint - Ensure all tests pass and functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Preserve existing interaction behaviors
  - [ ] 8.1 Maintain click outside to close behavior
    - Ensure outside click closes both boxes on desktop
    - Preserve mobile-specific close behavior
    - Test with various click targets and scenarios
    - _Requirements: 6.5_

  - [ ]* 8.2 Write property test for interaction behavior preservation
    - **Property 12: Interaction Behavior Preservation**
    - **Validates: Requirements 6.1, 6.2, 6.4, 6.5**

  - [ ] 8.3 Verify search timing and debounce behavior
    - Ensure existing debounce timing is maintained
    - Test minimum character requirements
    - Verify search request handling remains unchanged
    - _Requirements: 6.1_

- [ ] 9. Integration testing and final validation
  - [ ] 9.1 Test complete search workflows
    - Test search input to result selection flows
    - Verify mobile and desktop experiences
    - Test with various result combinations and edge cases
    - _Requirements: All requirements_

  - [ ]* 9.2 Write integration tests for complete workflows
    - Test end-to-end search functionality
    - Verify component integration and state management
    - Test responsive behavior across breakpoints

  - [ ] 9.3 Performance testing and optimization
    - Test rendering performance with large result sets
    - Verify scroll performance within boxes
    - Optimize any performance bottlenecks found
    - _Requirements: 7.3_

- [ ] 10. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation maintains full backward compatibility with existing search functionality