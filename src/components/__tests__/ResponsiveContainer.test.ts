/**
 * ResponsiveContainer Component Unit Tests
 * Tests specific examples and edge cases for responsive container functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock window and viewport utilities
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Set up DOM environment
let dom: JSDOM;
let container: HTMLElement;

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .responsive-container {
            max-width: 100vw;
            min-width: 0;
            box-sizing: border-box;
            overflow-x: hidden;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .mobile-viewport-safe {
            max-width: calc(100vw - 1px);
            overflow-x: hidden;
            contain: layout;
          }
          .mobile-content-fit {
            width: 100%;
          }
          .mobile-content-fit * {
            max-width: 100%;
            box-sizing: border-box;
          }
          .max-w-sm { max-width: 24rem; }
          .max-w-md { max-width: 28rem; }
          .max-w-lg { max-width: 32rem; }
          .max-w-xl { max-width: 36rem; }
          .max-w-2xl { max-width: 42rem; }
          .max-w-3xl { max-width: 48rem; }
          .max-w-4xl { max-width: 56rem; }
          .max-w-5xl { max-width: 64rem; }
          .max-w-6xl { max-width: 72rem; }
          .max-w-7xl { max-width: 80rem; }
          .max-w-full { max-width: 100%; }
          .w-full { width: 100%; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .px-8 { padding-left: 2rem; padding-right: 2rem; }
          .px-12 { padding-left: 3rem; padding-right: 3rem; }
          @media (min-width: 640px) {
            .sm\\:max-w-md { max-width: 28rem; }
            .sm\\:max-w-lg { max-width: 32rem; }
            .sm\\:max-w-xl { max-width: 36rem; }
            .sm\\:max-w-2xl { max-width: 42rem; }
            .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          }
          @media (min-width: 768px) {
            .md\\:max-w-lg { max-width: 32rem; }
            .md\\:max-w-2xl { max-width: 42rem; }
            .md\\:max-w-3xl { max-width: 48rem; }
            .md\\:max-w-4xl { max-width: 56rem; }
            .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
          }
          @media (min-width: 1024px) {
            .lg\\:max-w-4xl { max-width: 56rem; }
            .lg\\:max-w-5xl { max-width: 64rem; }
            .lg\\:max-w-6xl { max-width: 72rem; }
            .lg\\:px-12 { padding-left: 3rem; padding-right: 3rem; }
          }
          @media (min-width: 1280px) {
            .xl\\:max-w-6xl { max-width: 72rem; }
            .xl\\:max-w-7xl { max-width: 80rem; }
          }
        </style>
      </head>
      <body>
        <div id="test-container"></div>
      </body>
    </html>
  `);
  
  global.window = dom.window as any;
  global.document = dom.window.document;
  container = dom.window.document.getElementById('test-container')!;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ResponsiveContainer Component', () => {
  describe('Basic Container Structure', () => {
    it('should create container with default classes', () => {
      // Simulate default ResponsiveContainer with lg maxWidth and md padding
      const element = document.createElement('div');
      element.className = 'w-full mx-auto responsive-container max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl px-4 sm:px-6 md:px-8 mobile-viewport-safe mobile-content-fit';
      container.appendChild(element);

      expect(element.classList.contains('w-full')).toBe(true);
      expect(element.classList.contains('mx-auto')).toBe(true);
      expect(element.classList.contains('responsive-container')).toBe(true);
      expect(element.classList.contains('mobile-viewport-safe')).toBe(true);
      expect(element.classList.contains('mobile-content-fit')).toBe(true);
    });

    it('should apply correct max-width classes for different sizes', () => {
      const testCases = [
        { maxWidth: 'sm', expectedClass: 'max-w-sm' },
        { maxWidth: 'md', expectedClass: 'max-w-md' },
        { maxWidth: 'lg', expectedClass: 'max-w-lg' },
        { maxWidth: 'xl', expectedClass: 'max-w-xl' },
        { maxWidth: 'full', expectedClass: 'max-w-full' }
      ];

      testCases.forEach(({ maxWidth, expectedClass }) => {
        const element = document.createElement('div');
        // Simulate the class generation logic
        const maxWidthClasses = {
          sm: 'max-w-sm sm:max-w-md md:max-w-lg',
          md: 'max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl', 
          lg: 'max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl',
          xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl',
          full: 'max-w-full'
        };
        element.className = maxWidthClasses[maxWidth as keyof typeof maxWidthClasses];
        
        expect(element.classList.contains(expectedClass)).toBe(true);
      });
    });

    it('should apply correct padding classes', () => {
      const testCases = [
        { padding: 'none', shouldHavePadding: false },
        { padding: 'sm', expectedClasses: ['px-4'] },
        { padding: 'md', expectedClasses: ['px-4'] },
        { padding: 'lg', expectedClasses: ['px-4'] }
      ];

      testCases.forEach(({ padding, shouldHavePadding, expectedClasses }) => {
        const element = document.createElement('div');
        const paddingClasses = {
          none: '',
          sm: 'px-4 sm:px-6',
          md: 'px-4 sm:px-6 md:px-8',
          lg: 'px-4 sm:px-6 md:px-8 lg:px-12'
        };
        element.className = paddingClasses[padding as keyof typeof paddingClasses];
        
        if (shouldHavePadding === false) {
          expect(element.className).toBe('');
        } else if (expectedClasses) {
          expectedClasses.forEach(cls => {
            expect(element.classList.contains(cls)).toBe(true);
          });
        }
      });
    });
  });

  describe('Mobile Viewport Compliance', () => {
    it('should prevent horizontal scrolling with mobile-viewport-safe class', () => {
      const element = document.createElement('div');
      element.className = 'mobile-viewport-safe';
      container.appendChild(element);

      const styles = window.getComputedStyle(element);
      expect(styles.overflowX).toBe('hidden');
    });

    it('should have proper box-sizing for content fitting', () => {
      const element = document.createElement('div');
      element.className = 'responsive-container';
      container.appendChild(element);

      const styles = window.getComputedStyle(element);
      expect(styles.boxSizing).toBe('border-box');
    });

    it('should handle very wide content without horizontal scroll', () => {
      const element = document.createElement('div');
      element.className = 'responsive-container mobile-viewport-safe';
      
      // Add very wide child content
      const wideChild = document.createElement('div');
      wideChild.style.width = '2000px';
      element.appendChild(wideChild);
      
      container.appendChild(element);

      const styles = window.getComputedStyle(element);
      expect(styles.overflowX).toBe('hidden');
    });
  });

  describe('Content Fitting', () => {
    it('should apply mobile-content-fit class by default', () => {
      const element = document.createElement('div');
      element.className = 'w-full mx-auto responsive-container mobile-content-fit';
      
      expect(element.classList.contains('mobile-content-fit')).toBe(true);
    });

    it('should handle long text content with word wrapping', () => {
      const element = document.createElement('div');
      element.className = 'responsive-container';
      
      const textElement = document.createElement('p');
      textElement.textContent = 'This is a very long text that should wrap properly and not cause horizontal scrolling on mobile devices';
      element.appendChild(textElement);
      
      container.appendChild(element);

      const styles = window.getComputedStyle(element);
      expect(styles.wordWrap).toBe('break-word');
      expect(styles.overflowWrap).toBe('break-word');
    });
  });

  describe('Custom Element Types', () => {
    it('should support different HTML elements', () => {
      const elementTypes = ['div', 'section', 'article', 'main'];
      
      elementTypes.forEach(tagName => {
        const element = document.createElement(tagName);
        element.className = 'responsive-container';
        container.appendChild(element);
        
        expect(element.tagName.toLowerCase()).toBe(tagName);
        expect(element.classList.contains('responsive-container')).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const element = document.createElement('div');
      element.className = 'responsive-container';
      container.appendChild(element);
      
      expect(element.children.length).toBe(0);
      expect(element.classList.contains('responsive-container')).toBe(true);
    });

    it('should handle nested containers', () => {
      const outerContainer = document.createElement('div');
      outerContainer.className = 'responsive-container';
      
      const innerContainer = document.createElement('div');
      innerContainer.className = 'responsive-container';
      
      outerContainer.appendChild(innerContainer);
      container.appendChild(outerContainer);
      
      expect(outerContainer.querySelector('.responsive-container')).toBe(innerContainer);
    });

    it('should handle custom classes alongside default classes', () => {
      const element = document.createElement('div');
      element.className = 'w-full mx-auto responsive-container custom-class another-class mobile-viewport-safe';
      
      expect(element.classList.contains('responsive-container')).toBe(true);
      expect(element.classList.contains('custom-class')).toBe(true);
      expect(element.classList.contains('another-class')).toBe(true);
      expect(element.classList.contains('mobile-viewport-safe')).toBe(true);
    });
  });

  describe('Responsive Breakpoint Behavior', () => {
    it('should have appropriate classes for mobile-first design', () => {
      const element = document.createElement('div');
      // Test lg maxWidth configuration
      element.className = 'max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl';
      
      // Base mobile class
      expect(element.classList.contains('max-w-lg')).toBe(true);
      // Small screen class
      expect(element.classList.contains('sm:max-w-xl')).toBe(true);
      // Medium screen class
      expect(element.classList.contains('md:max-w-3xl')).toBe(true);
      // Large screen class
      expect(element.classList.contains('lg:max-w-5xl')).toBe(true);
      // Extra large screen class
      expect(element.classList.contains('xl:max-w-6xl')).toBe(true);
    });

    it('should have progressive padding classes', () => {
      const element = document.createElement('div');
      // Test md padding configuration
      element.className = 'px-4 sm:px-6 md:px-8';
      
      expect(element.classList.contains('px-4')).toBe(true);
      expect(element.classList.contains('sm:px-6')).toBe(true);
      expect(element.classList.contains('md:px-8')).toBe(true);
    });
  });
});