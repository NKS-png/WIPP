/**
 * Search-related TypeScript interfaces and types
 * Defines the structure for unified search functionality
 */

export interface SearchResult {
  id: string;
  type: 'user' | 'community' | 'post' | 'project';
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchTime: number;
  query?: string;
  types?: string[];
  error?: string;
  details?: string;
}

export interface SearchRequest {
  query: string;
  types?: ('user' | 'community' | 'post' | 'project')[];
  limit?: number;
}

export interface SearchOptions {
  maxResults?: number;
  debounceMs?: number;
  placeholder?: string;
  showInNavbar?: boolean;
}

export interface SearchResultMetadata {
  // User metadata
  username?: string;
  avatar_url?: string;
  
  // Community metadata
  image_url?: string;
  created_at?: string;
  
  // Post metadata
  author?: string;
  community?: string;
  post_type?: string;
  
  // Project metadata
  // (uses author, image_url, created_at from above)
}

export interface SearchError {
  error: string;
  details?: string;
  results: SearchResult[];
  totalCount: 0;
  searchTime: 0;
}

export type SearchContentType = 'user' | 'community' | 'post' | 'project';

export interface SearchGroupedResults {
  user: SearchResult[];
  community: SearchResult[];
  post: SearchResult[];
  project: SearchResult[];
}