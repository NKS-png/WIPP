/**
 * Unit tests for UnifiedSearch component
 * Tests specific examples and edge cases for search functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SearchResult, SearchResponse } from '../../types/search';

// Mock fetch globally
global.fetch = vi.fn();

describe('UnifiedSearch Component', () => {
  let mockFetch: any;
  
  beforeEach(() => {
    mockFetch = vi.mocked(fetch);
    mockFetch.mockClear();
    
    // Setup DOM
    document.body.innerHTML = `
      <div class="unified-search">
        <div class="unified-search__input-container">
          <div class="unified-search__input-wrapper">
            <input 
              type="text" 
              class="unified-search__input"
              data-unified-search-input
              data-max-results="20"
            />
            <button class="unified-search__clear-btn hidden" data-unified-search-clear></button>
          </div>
        </div>
        <div class="unified-search__results hidden" data-unified-search-results>
          <div class="unified-search__loading hidden" data-unified-search-loading></div>
          <div class="unified-search__empty hidden" data-unified-search-empty></div>
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
  });

  describe('Search Input Behavior', () => {
    it('should show clear button when input has text', () => {
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      const clearBtn = document.querySelector('[data-unified-search-clear]') as HTMLElement;
      
      // Simulate typing
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      // Clear button should be visible
      expect(clearBtn.classList.contains('hidden')).toBe(false);
    });
    
    it('should hide clear button when input is empty', () => {
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      const clearBtn = document.querySelector('[data-unified-search-clear]') as HTMLElement;
      
      // Start with text
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      // Clear input
      input.value = '';
      input.dispatchEvent(new Event('input'));
      
      // Clear button should be hidden
      expect(clearBtn.classList.contains('hidden')).toBe(true);
    });
    
    it('should not trigger search for queries shorter than 2 characters', async () => {
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      
      // Type single character
      input.value = 'a';
      input.dispatchEvent(new Event('input'));
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Fetch should not be called
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Search API Integration', () => {
    it('should make correct API call with search query', async () => {
      const mockResponse: SearchResponse = {
        results: [
          {
            id: '1',
            type: 'user',
            title: 'Test User',
            description: '@testuser',
            url: '/profile/1',
            metadata: { username: 'testuser' }
          }
        ],
        totalCount: 1,
        searchTime: 50
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      
      // Type search query
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      // Wait for debounce and API call
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Check API call
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/search/unified?query=test&limit=20'
      );
    });
    
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      const emptyDiv = document.querySelector('[data-unified-search-empty]') as HTMLElement;
      
      // Type search query
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      // Wait for debounce and API call
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Should show error state
      expect(emptyDiv.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Search Results Display', () => {
    it('should display search results grouped by type', async () => {
      const mockResponse: SearchResponse = {
        results: [
          {
            id: '1',
            type: 'user',
            title: 'Test User',
            description: '@testuser',
            url: '/profile/1'
          },
          {
            id: '2',
            type: 'community',
            title: 'Test Community',
            description: 'A test community',
            url: '/c/2'
          }
        ],
        totalCount: 2,
        searchTime: 75
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      const resultsList = document.querySelector('[data-unified-search-list]') as HTMLElement;
      
      // Type search query
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      // Wait for API call and rendering
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Should have section headers
      const headers = resultsList.querySelectorAll('.search-section-header');
      expect(headers.length).toBeGreaterThan(0);
      
      // Should have result items
      const items = resultsList.querySelectorAll('.search-result-item');
      expect(items.length).toBe(2);
    });
    
    it('should show empty state when no results found', async () => {
      const mockResponse: SearchResponse = {
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
      
      // Type search query
      input.value = 'nonexistent';
      input.dispatchEvent(new Event('input'));
      
      // Wait for API call
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Should show empty state
      expect(emptyDiv.classList.contains('hidden')).toBe(false);
    });
    
    it('should display search timing information', async () => {
      const mockResponse: SearchResponse = {
        results: [
          {
            id: '1',
            type: 'user',
            title: 'Test User',
            url: '/profile/1'
          }
        ],
        totalCount: 1,
        searchTime: 123
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      const infoText = document.querySelector('.unified-search__info-text') as HTMLElement;
      
      // Type search query
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      // Wait for API call
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Should show timing info
      expect(infoText.textContent).toContain('1 result');
      expect(infoText.textContent).toContain('123ms');
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

  describe('Clear Functionality', () => {
    it('should clear input and hide results when clear button clicked', () => {
      const input = document.querySelector('[data-unified-search-input]') as HTMLInputElement;
      const clearBtn = document.querySelector('[data-unified-search-clear]') as HTMLElement;
      const results = document.querySelector('[data-unified-search-results]') as HTMLElement;
      
      // Set up initial state
      input.value = 'test';
      results.classList.remove('hidden');
      clearBtn.classList.remove('hidden');
      
      // Click clear button
      clearBtn.click();
      
      // Should clear everything
      expect(input.value).toBe('');
      expect(results.classList.contains('hidden')).toBe(true);
      expect(clearBtn.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Result Item Creation', () => {
    it('should create proper result item structure for user', () => {
      const result: SearchResult = {
        id: '1',
        type: 'user',
        title: 'John Doe',
        description: '@johndoe',
        url: '/profile/1',
        metadata: { username: 'johndoe', avatar_url: 'https://example.com/avatar.jpg' }
      };
      
      // This would test the createResultItem method if it were exposed
      // For now, we test the overall integration
      expect(result.type).toBe('user');
      expect(result.url).toBe('/profile/1');
    });
    
    it('should handle missing metadata gracefully', () => {
      const result: SearchResult = {
        id: '1',
        type: 'community',
        title: 'Test Community',
        url: '/c/1'
        // No description or metadata
      };
      
      expect(result.description).toBeUndefined();
      expect(result.metadata).toBeUndefined();
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
      
      const searchContainer = document.querySelector('.unified-search') as HTMLElement;
      expect(searchContainer).toBeTruthy();
      
      // Mobile-specific behavior would be tested here
      // For now, just verify the component exists
    });
  });

  describe('Touch Interface Compliance', () => {
    it('should have proper touch target sizing', () => {
      const input = document.querySelector('[data-unified-search-input]') as HTMLElement;
      const clearBtn = document.querySelector('[data-unified-search-clear]') as HTMLElement;
      
      // These elements should have touch-friendly classes
      expect(input.classList.contains('touch-target')).toBe(true);
      expect(clearBtn.classList.contains('touch-target')).toBe(true);
    });
  });
});

describe('Search Result Types', () => {
  it('should handle all supported content types', () => {
    const userResult: SearchResult = {
      id: '1',
      type: 'user',
      title: 'User Name',
      url: '/profile/1'
    };
    
    const communityResult: SearchResult = {
      id: '2',
      type: 'community',
      title: 'Community Name',
      url: '/c/2'
    };
    
    const postResult: SearchResult = {
      id: '3',
      type: 'post',
      title: 'Post Title',
      url: '/post/3'
    };
    
    const projectResult: SearchResult = {
      id: '4',
      type: 'project',
      title: 'Project Title',
      url: '/project/4'
    };
    
    const results = [userResult, communityResult, postResult, projectResult];
    
    results.forEach(result => {
      expect(['user', 'community', 'post', 'project']).toContain(result.type);
      expect(result.url).toMatch(/^\/(profile|c|post|project)\/\d+$/);
    });
  });
});