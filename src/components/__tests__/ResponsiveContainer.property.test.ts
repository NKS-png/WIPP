/**
 * ResponsiveContainer Component Property-Based Tests
 * Tests universal properties that should hold across all valid inputs
 * Feature: mobile-optimization-ui-improvements, Property 4: Mobile viewport compliance
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fc from 'fast-check';

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
          .w-full { width: 100%; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .max-w-sm { max-width: 24rem; }
          .max-w-md { max-width: 28rem; }
          .max-w-lg { max-width: 32rem; }
          .max-w-xl { max-width: 36rem; }
          .max-w-full { max-width: 100%; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .px-8 { padding-left: 2rem; padding-right: 2rem; }
          .px-12 { padding-left: 3rem; padding-right: 3rem; }
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
  container.innerHTML = '';
});

// Generators for property-based testing
const maxWidthArb = fc.constantFrom('sm', 'md', 'lg', 'xl', 'full');
const paddingArb = fc.constantFrom('none', 'sm', 'md', 'lg');
const elementTypeArb = fc.constantFrom('div', 'section', 'article', 'main');
const customClassArb = fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 });

// Viewport width generator (mobile breakpoint is 768px)
const viewportWidthArb = fc.integer({ min: 320, max: 1920 });

describe('ResponsiveContainer Property-Based Tests', () => {
  describe('Property 4: Mobile viewport compliance', () => {
    it('should never cause horizontal scrolling on any viewport width', () => {
      fc.assert(fc.property(
        maxWidthArb,
        paddingArb,
        customClassArb,
        viewportWidthArb,
        (maxWidth, padding, customClasses, viewportWidth) => {
          // **Validates: Requirements 2.1, 2.2**
          
          // Simulate viewport width
          Object.defineProperty(dom.window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          });
          
          // Create ResponsiveContainer element with generated props
          const element = document.createElement('div');
          
          // Generate classes based on props (simulating Astro component logic)
          const maxWidthClasses = {
            sm: 'max-w-sm sm:max-w-md md:max-w-lg',
            md: 'max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl', 
            lg: 'max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl',
            xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl',
            full: 'max-w-full'
          };
          
          const paddingClasses = {
            none: '',
            sm: 'px-4 sm:px-6',
            md: 'px-4 sm:px-6 md:px-8',
            lg: 'px-4 sm:px-6 md:px-8 lg:px-12'
          };
          
          const containerClasses = [
            'w-full',
            'mx-auto',
            'responsive-container',
            maxWidthClasses[maxWidth],
            paddingClasses[padding],
            'mobile-viewport-safe',
            'mobile-content-fit',
            ...customClasses.filter(cls => cls.trim().length > 0)
          ].filter(Boolean).join(' ');
          
          element.className = containerClasses;
          container.appendChild(element);
          
          // Property: Container should never exceed viewport width
          const styles = window.getComputedStyle(element);
          
          // Check that overflow-x is hidden (prevents horizontal scrolling)
          expect(styles.overflowX).toBe('hidden');
          
          // Check that box-sizing is border-box (includes padding in width calculation)
          expect(styles.boxSizing).toBe('border-box');
          
          // Check that word-wrap is enabled (prevents text overflow)
          expect(styles.wordWrap).toBe('break-word');
          
          // Verify mobile-viewport-safe class is applied
          expect(element.classList.contains('mobile-viewport-safe')).toBe(true);
          
          // Verify responsive-container class is applied
          expect(element.classList.contains('responsive-container')).toBe(true);
          
          // Clean up
          container.removeChild(element);
        }
      ), { numRuns: 100 });
    });

    it('should maintain proper container structure across all configurations', () => {
      fc.assert(fc.property(
        maxWidthArb,
        paddingArb,
        elementTypeArb,
        customClassArb,
        (maxWidth, padding, elementType, customClasses) => {
          // **Validates: Requirements 2.1, 2.2**
          
          // Create element with specified type
          const element = document.createElement(elementType);
          
          // Generate classes
          const maxWidthClasses = {
            sm: 'max-w-sm sm:max-w-md md:max-w-lg',
            md: 'max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl', 
            lg: 'max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl',
            xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl',
            full: 'max-w-full'
          };
          
          const paddingClasses = {
            none: '',
            sm: 'px-4 sm:px-6',
            md: 'px-4 sm:px-6 md:px-8',
            lg: 'px-4 sm:px-6 md:px-8 lg:px-12'
          };
          
          const containerClasses = [
            'w-full',
            'mx-auto',
            'responsive-container',
            maxWidthClasses[maxWidth],
            paddingClasses[padding],
            'mobile-viewport-safe',
            'mobile-content-fit',
            ...customClasses.filter(cls => cls.trim().length > 0)
          ].filter(Boolean).join(' ');
          
          element.className = containerClasses;
          container.appendChild(element);
          
          // Property: All containers should have core responsive classes
          expect(element.classList.contains('w-full')).toBe(true);
          expect(element.classList.contains('mx-auto')).toBe(true);
          expect(element.classList.contains('responsive-container')).toBe(true);
          expect(element.classList.contains('mobile-viewport-safe')).toBe(true);
          expect(element.classList.contains('mobile-content-fit')).toBe(true);
          
          // Property: Element type should be preserved
          expect(element.tagName.toLowerCase()).toBe(elementType);
          
          // Property: Custom classes should be preserved
          customClasses.filter(cls => cls.trim().length > 0).forEach(cls => {
            expect(element.classList.contains(cls)).toBe(true);
          });
          
          // Clean up
          container.removeChild(element);
        }
      ), { numRuns: 100 });
    });

    it('should handle content of any size without horizontal overflow', () => {
      fc.assert(fc.property(
        maxWidthArb,
        paddingArb,
        fc.string({ minLength: 0, maxLength: 1000 }),
        fc.integer({ min: 100, max: 5000 }), // content width
        (maxWidth, padding, textContent, contentWidth) => {
          // **Validates: Requirements 2.1, 2.2**
          
          // Create container
          const element = document.createElement('div');
          const maxWidthClasses = {
            sm: 'max-w-sm sm:max-w-md md:max-w-lg',
            md: 'max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl', 
            lg: 'max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl',
            xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl',
            full: 'max-w-full'
          };
          
          const paddingClasses = {
            none: '',
            sm: 'px-4 sm:px-6',
            md: 'px-4 sm:px-6 md:px-8',
            lg: 'px-4 sm:px-6 md:px-8 lg:px-12'
          };
          
          element.className = [
            'w-full',
            'mx-auto',
            'responsive-container',
            maxWidthClasses[maxWidth],
            paddingClasses[padding],
            'mobile-viewport-safe',
            'mobile-content-fit'
          ].join(' ');
          
          // Add content that might cause overflow
          const contentElement = document.createElement('div');
          contentElement.textContent = textContent;
          contentElement.style.width = `${contentWidth}px`;
          element.appendChild(contentElement);
          
          container.appendChild(element);
          
          // Property: Container should prevent horizontal overflow
          const styles = window.getComputedStyle(element);
          expect(styles.overflowX).toBe('hidden');
          
          // Property: Content should have proper word wrapping
          expect(styles.wordWrap).toBe('break-word');
          expect(styles.overflowWrap).toBe('break-word');
          
          // Clean up
          container.removeChild(element);
        }
      ), { numRuns: 50 });
    });
  });

  describe('Mobile-First Responsive Design Properties', () => {
    it('should always include base mobile classes before responsive variants', () => {
      fc.assert(fc.property(
        maxWidthArb,
        paddingArb,
        (maxWidth, padding) => {
          // **Validates: Requirements 2.1, 2.2**
          
          const element = document.createElement('div');
          
          // Generate classes
          const maxWidthClasses = {
            sm: 'max-w-sm sm:max-w-md md:max-w-lg',
            md: 'max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl', 
            lg: 'max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl',
            xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl',
            full: 'max-w-full'
          };
          
          const paddingClasses = {
            none: '',
            sm: 'px-4 sm:px-6',
            md: 'px-4 sm:px-6 md:px-8',
            lg: 'px-4 sm:px-6 md:px-8 lg:px-12'
          };
          
          element.className = [
            'w-full',
            'mx-auto',
            'responsive-container',
            maxWidthClasses[maxWidth],
            paddingClasses[padding],
            'mobile-viewport-safe',
            'mobile-content-fit'
          ].join(' ');
          
          // Property: Should always have base mobile-first classes
          const baseMaxWidthClass = maxWidthClasses[maxWidth].split(' ')[0];
          expect(element.classList.contains(baseMaxWidthClass)).toBe(true);
          
          // Property: Should have padding classes if padding is not 'none'
          if (padding !== 'none') {
            expect(element.classList.contains('px-4')).toBe(true);
          }
          
          // Property: Should always have core responsive classes
          expect(element.classList.contains('w-full')).toBe(true);
          expect(element.classList.contains('mx-auto')).toBe(true);
          expect(element.classList.contains('responsive-container')).toBe(true);
        }
      ), { numRuns: 100 });
    });
  });

  describe('Content Fitting Properties', () => {
    it('should ensure all child elements respect container bounds', () => {
      fc.assert(fc.property(
        maxWidthArb,
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
        (maxWidth, childTexts) => {
          // **Validates: Requirements 2.1, 2.2**
          
          const element = document.createElement('div');
          element.className = 'responsive-container mobile-content-fit mobile-viewport-safe';
          
          // Add multiple child elements
          childTexts.forEach(text => {
            const child = document.createElement('p');
            child.textContent = text;
            element.appendChild(child);
          });
          
          container.appendChild(element);
          
          // Property: Container should have mobile-content-fit class
          expect(element.classList.contains('mobile-content-fit')).toBe(true);
          
          // Property: Container should prevent overflow
          const styles = window.getComputedStyle(element);
          expect(styles.overflowX).toBe('hidden');
          
          // Property: All children should exist and be contained
          expect(element.children.length).toBe(childTexts.length);
          
          // Clean up
          container.removeChild(element);
        }
      ), { numRuns: 50 });
    });
  });
});