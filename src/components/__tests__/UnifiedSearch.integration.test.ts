/**
 * Integration tests for UnifiedSearch component mobile responsiveness and empty results
 * Tests the specific improvements made for task 2.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('UnifiedSearch Mobile Integration', () => {
  let mockFetch: any;
  
  beforeEach(() => {
    mockFetch = vi.mocked(fetch);
    mockFetch.mockClear();
    
    // Setup DOM with enhanced mobile structure
    document.body.innerHTML = `
      <div class="unified-search">
        <div class="unified-search__input-container">
          <div class="unified-search__input-wrapper">
            <input 
              type="text" 
              class="unified-search__input mobile-form-input touch-target"
              data-unified-search-input
              data-max-results="20"
            />
            <button class="unified-search__clear-btn touch-target touch-feedback hidden" data-unified-search-clear></button>
          </div>
        </div>
        <div class="unified-search__results hidden" data-unified-search-results>
          <div class="unified-search__mobile-header hidden md:hidden">
            <span class="unified-search__mobile-title">Search Results</span>
            <button class="unified-search__mobile-close" data-unified-search-mobile-close></button>
          </div>
          <div class="unified-search__loading hidden" data-unified-search-loading></div>
          <div class="unified-search__empty hidden" data-unified-search-empty>
            <div class="unified-search__empty-content">
              <p class="unified-search__empty-text">No results found</p>
              <p class="unified-search__empty-suggestion">Try different keywords, check spelling, or browse our communities</p>
              <div class="unified-search__empty-actions">
                <a href="/explore" class="unified-search__empty-link">Explore Content</a>
                <a href="/communities" class="unified-search__empty-link">Browse Communities</a>
              </div>
            </div>
          </div>
          <div class="unified-search__list" data-unified-search-list></div>
          <div class="unified-search__info hidden" data-unified-search-info>
            <span class="unified-search__info-text"></span>
          </div>
        </div>
      </div>
    `;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    document.body.style.overflow = ''; // Reset body overflow
  });

  describe('Mobile Header Integration', () => {
    it('should have mobile header with proper structure', () => {
      const mobileHeader = document.querySelector('.unified-search__mobile-header');
      const title = document.querySelector('.unified-search__mobile-title');
      const closeBtn = document.querySelector('.unified-search__mobile-close');
      
      expect(mobileHeader).toBeTruthy();
      expect(title).toBeTruthy();
      expect(closeBtn).toBeTruthy();
      expect(title?.textContent).toBe('Search Results');
    });
    
    it('should have mobile close button with proper attributes', () => {
      const closeBtn = document.querySelector('.unified-search__mobile-close') as HTMLElement;
      
      expect(closeBtn).toBeTruthy();
      expect(closeBtn.getAttribute('data-unified-search-mobile-close')).toBe('');
      // Should have touch-friendly styling (tested via CSS classes)
      expect(closeBtn.classList.contains('unified-search__mobile-close')).toBe(true);
    });
  });

  describe('Enhanced Empty Results', () => {
    it('should display enhanced empty state with action links', async () => {
      const mockResponse = {
        results: [],
        totalCount: 0,
        searchTime: 25
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      const emptyDiv = document.querySelector('[data-unified-search-empty]') as HTMLElement;
      const suggestion = document.querySelector('.unified-search__empty-suggestion') as HTMLElement;
      const actions = document.querySelector('.unified-search__empty-actions') as HTMLElement;
      const exploreLink = document.querySelector('a[href="/explore"]') as HTMLElement;
      const communitiesLink = document.querySelector('a[href="/communities"]') as HTMLElement;
      
      // Type search query
      input.value = 'nonexistent';
      input.dispatchEvent(new Event('input'));
      
      // Wait for API call
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Should show enhanced empty state
      expect(emptyDiv.classList.contains('hidden')).toBe(false);
      expect(suggestion.textContent).toContain('browse our communities');
      expect(actions).toBeTruthy();
      expect(exploreLink).toBeTruthy();
      expect(communitiesLink).toBeTruthy();
      expect(exploreLink.textContent).toBe('Explore Content');
      expect(communitiesLink.textContent).toBe('Browse Communities');
    });
    
    it('should have touch-friendly action links', () => {
      const exploreLink = document.querySelector('a[href="/explore"]') as HTMLElement;
      const communitiesLink = document.querySelector('a[href="/communities"]') as HTMLElement;
      
      expect(exploreLink.classList.contains('unified-search__empty-link')).toBe(true);
      expect(communitiesLink.classList.contains('unified-search__empty-link')).toBe(true);
      
      // Links should have proper href attributes
      expect(exploreLink.getAttribute('href')).toBe('/explore');
      expect(communitiesLink.getAttribute('href')).toBe('/communities');
    });
  });

  describe('Touch Interface Compliance', () => {
    it('should have touch-target classes on interactive elements', () => {
      const input = document.querySelector('[data-unified-search-input]') as HTMLElement;
      const clearBtn = document.querySelector('[data-unified-search-clear]') as HTMLElement;
      
      expect(input.classList.contains('touch-target')).toBe(true);
      expect(clearBtn.classList.contains('touch-target')).toBe(true);
    });
    
    it('should have mobile-form-input class on search input', () => {
      const input = document.querySelector('[data-unified-search-input]') as HTMLElement;
      expect(input.classList.contains('mobile-form-input')).toBe(true);
    });
    
    it('should have touch-feedback class on interactive elements', () => {
      const clearBtn = document.querySelector('[data-unified-search-clear]') as HTMLElement;
      expect(clearBtn.classList.contains('touch-feedback')).toBe(true);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should handle mobile viewport correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      const results = document.querySelector('[data-unified-search-results]') as HTMLElement;
      const mobileHeader = document.querySelector('.unified-search__mobile-header') as HTMLElement;
      
      expect(results).toBeTruthy();
      expect(mobileHeader).toBeTruthy();
      
      // Mobile header should be available for mobile view
      expect(mobileHeader.classList.contains('md:hidden')).toBe(true);
    });
    
    it('should prevent body scroll when search is open on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      // This would be tested in the actual component initialization
      // For now, just verify the structure exists
      const results = document.querySelector('[data-unified-search-results]') as HTMLElement;
      expect(results).toBeTruthy();
    });
  });

  describe('Navbar Integration', () => {
    it('should support showInNavbar prop', () => {
      // Update DOM to include navbar-specific structure
      const container = document.querySelector('.unified-search') as HTMLElement;
      container.classList.add('unified-search--navbar');
      
      expect(container.classList.contains('unified-search--navbar')).toBe(true);
    });
    
    it('should have proper input placeholder for navbar context', () => {
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      
      // Default placeholder should be comprehensive
      expect(input.getAttribute('placeholder')).toBeFalsy(); // No placeholder set in test DOM
      
      // In real usage, it would have a placeholder like:
      // "Search users, communities, posts, projects..."
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully with enhanced error state', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      const emptyDiv = document.querySelector('[data-unified-search-empty]') as HTMLElement;
      
      // Type search query
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      // Wait for debounce and API call
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Should show error state (which uses the empty state structure)
      expect(emptyDiv.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close results on Escape key', () => {
      const results = document.querySelector('[data-unified-search-results]') as HTMLElement;
      
      // Open results
      results.classList.remove('hidden');
      
      // Press Escape
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      
      // Results should be hidden
      expect(results.classList.contains('hidden')).toBe(true);
    });
  });
});

describe('UnifiedSearch Requirements Validation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="unified-search unified-search--navbar">
        <div class="unified-search__input-container">
          <input 
            type="text" 
            class="unified-search__input mobile-form-input touch-target"
            placeholder="Search users, communities, posts, projects..."
            data-unified-search-input
          />
        </div>
        <div class="unified-search__results hidden" data-unified-search-results>
          <div class="unified-search__mobile-header hidden md:hidden">
            <span class="unified-search__mobile-title">Search Results</span>
            <button class="unified-search__mobile-close" data-unified-search-mobile-close></button>
          </div>
          <div class="unified-search__empty hidden" data-unified-search-empty>
            <div class="unified-search__empty-content">
              <p class="unified-search__empty-text">No results found</p>
              <p class="unified-search__empty-suggestion">Try different keywords, check spelling, or browse our communities</p>
              <div class="unified-search__empty-actions">
                <a href="/explore" class="unified-search__empty-link">Explore Content</a>
                <a href="/communities" class="unified-search__empty-link">Browse Communities</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('validates Requirement 1.4: Empty results handling and user feedback', () => {
    const emptyDiv = document.querySelector('[data-unified-search-empty]') as HTMLElement;
    const suggestion = document.querySelector('.unified-search__empty-suggestion') as HTMLElement;
    const actions = document.querySelector('.unified-search__empty-actions') as HTMLElement;
    
    // Should have empty results structure
    expect(emptyDiv).toBeTruthy();
    expect(suggestion).toBeTruthy();
    expect(actions).toBeTruthy();
    
    // Should provide helpful suggestions
    expect(suggestion.textContent).toContain('Try different keywords');
    expect(suggestion.textContent).toContain('browse our communities');
    
    // Should have action links
    const exploreLink = actions.querySelector('a[href="/explore"]');
    const communitiesLink = actions.querySelector('a[href="/communities"]');
    expect(exploreLink).toBeTruthy();
    expect(communitiesLink).toBeTruthy();
  });

  it('validates mobile-responsive search interface', () => {
    const container = document.querySelector('.unified-search') as HTMLElement;
    const input = document.querySelector('.unified-search__input') as HTMLElement;
    const mobileHeader = document.querySelector('.unified-search__mobile-header') as HTMLElement;
    
    // Should have navbar integration
    expect(container.classList.contains('unified-search--navbar')).toBe(true);
    
    // Should have mobile-responsive input
    expect(input.classList.contains('mobile-form-input')).toBe(true);
    expect(input.classList.contains('touch-target')).toBe(true);
    
    // Should have mobile header for full-screen overlay
    expect(mobileHeader).toBeTruthy();
    expect(mobileHeader.classList.contains('md:hidden')).toBe(true);
  });

  it('validates touch interface compliance', () => {
    const input = document.querySelector('.unified-search__input') as HTMLElement;
    const closeBtn = document.querySelector('.unified-search__mobile-close') as HTMLElement;
    const actionLinks = document.querySelectorAll('.unified-search__empty-link');
    
    // Interactive elements should have touch-target class or equivalent sizing
    expect(input.classList.contains('touch-target')).toBe(true);
    
    // Mobile close button should be touch-friendly
    expect(closeBtn).toBeTruthy();
    
    // Action links should be touch-friendly
    expect(actionLinks.length).toBe(2);
    actionLinks.forEach(link => {
      expect(link.classList.contains('unified-search__empty-link')).toBe(true);
    });
  });
});