/**
 * Responsive utilities and mobile breakpoint system
 * Provides viewport detection, mobile device identification, and responsive utilities
 */

// Breakpoint configuration following mobile-first approach
export const BREAKPOINTS = {
  xs: 0,      // 0px and up
  sm: 640,    // 640px and up
  md: 768,    // 768px and up (mobile breakpoint)
  lg: 1024,   // 1024px and up
  xl: 1280,   // 1280px and up
  xxl: 1536   // 1536px and up
} as const;

// Touch interface standards
export const TOUCH_STANDARDS = {
  minSize: 44,        // Minimum touch target size in pixels
  spacing: 8,         // Minimum spacing between touch targets
  tapHighlight: 'rgba(0, 0, 0, 0.1)' // Touch feedback color
} as const;

// Mobile breakpoint (768px and below)
export const MOBILE_BREAKPOINT = BREAKPOINTS.md;

/**
 * Detects if the current viewport is mobile (768px and below)
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Detects if the device is likely a mobile device based on user agent
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'mobile'
  ];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}

/**
 * Detects if the device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         (navigator as any).msMaxTouchPoints > 0;
}

/**
 * Gets the current breakpoint based on viewport width
 */
export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS {
  if (typeof window === 'undefined') return 'md';
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS.xxl) return 'xxl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Checks if the current viewport matches a specific breakpoint
 */
export function matchesBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
}

/**
 * Utility to create responsive classes based on breakpoint
 */
export function getResponsiveClasses(
  baseClasses: string,
  responsiveClasses: Partial<Record<keyof typeof BREAKPOINTS, string>>
): string {
  const classes = [baseClasses];
  
  Object.entries(responsiveClasses).forEach(([breakpoint, classNames]) => {
    if (classNames) {
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
      classes.push(`${prefix}${classNames}`);
    }
  });
  
  return classes.join(' ');
}

/**
 * Validates touch target size compliance
 */
export function validateTouchTarget(element: HTMLElement): {
  isValid: boolean;
  width: number;
  height: number;
  issues: string[];
} {
  const rect = element.getBoundingClientRect();
  const issues: string[] = [];
  
  if (rect.width < TOUCH_STANDARDS.minSize) {
    issues.push(`Width ${rect.width}px is below minimum ${TOUCH_STANDARDS.minSize}px`);
  }
  
  if (rect.height < TOUCH_STANDARDS.minSize) {
    issues.push(`Height ${rect.height}px is below minimum ${TOUCH_STANDARDS.minSize}px`);
  }
  
  return {
    isValid: issues.length === 0,
    width: rect.width,
    height: rect.height,
    issues
  };
}

/**
 * Checks spacing between adjacent touch targets
 */
export function validateTouchSpacing(element1: HTMLElement, element2: HTMLElement): {
  isValid: boolean;
  distance: number;
  minRequired: number;
} {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  
  // Calculate minimum distance between elements
  const horizontalDistance = Math.max(0, 
    Math.max(rect1.left - rect2.right, rect2.left - rect1.right)
  );
  const verticalDistance = Math.max(0,
    Math.max(rect1.top - rect2.bottom, rect2.top - rect1.bottom)
  );
  
  const distance = Math.min(horizontalDistance, verticalDistance);
  
  return {
    isValid: distance >= TOUCH_STANDARDS.spacing,
    distance,
    minRequired: TOUCH_STANDARDS.spacing
  };
}

/**
 * Viewport change listener utility
 */
export class ViewportObserver {
  private callbacks: Array<(breakpoint: keyof typeof BREAKPOINTS, isMobile: boolean) => void> = [];
  private currentBreakpoint: keyof typeof BREAKPOINTS;
  private resizeTimeout: number | null = null;

  constructor() {
    this.currentBreakpoint = getCurrentBreakpoint();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  private handleResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = window.setTimeout(() => {
      const newBreakpoint = getCurrentBreakpoint();
      const isMobile = isMobileViewport();
      
      if (newBreakpoint !== this.currentBreakpoint) {
        this.currentBreakpoint = newBreakpoint;
        this.callbacks.forEach(callback => callback(newBreakpoint, isMobile));
      }
    }, 100);
  }

  public subscribe(callback: (breakpoint: keyof typeof BREAKPOINTS, isMobile: boolean) => void) {
    this.callbacks.push(callback);
    
    // Call immediately with current state
    callback(this.currentBreakpoint, isMobileViewport());
    
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this));
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.callbacks = [];
  }
}

/**
 * Creates a global viewport observer instance
 */
export const viewportObserver = typeof window !== 'undefined' ? new ViewportObserver() : null;