/**
 * Help Center Service
 * Manages searchable documentation and self-service resources
 */

import { supabase } from '../supabase';
import type {
  HelpArticle,
  HelpCenterService as IHelpCenterService,
  SearchHelpRequest,
  SearchHelpResponse,
  SkillLevel
} from '../../types/support';

export class HelpCenterService implements IHelpCenterService {
  /**
   * Searches help articles based on query and filters
   */
  async searchArticles(request: SearchHelpRequest): Promise<SearchHelpResponse> {
    const startTime = Date.now();
    
    try {
      let query = supabase
        .from('help_articles')
        .select('*')
        .eq('is_published', true);

      // Apply text search
      if (request.query) {
        // Use full-text search on title, content, and keywords
        query = query.or(`title.ilike.%${request.query}%,content.ilike.%${request.query}%,search_keywords.cs.{${request.query}}`);
      }

      // Apply category filter
      if (request.category) {
        query = query.eq('category', request.category);
      }

      // Apply skill level filter
      if (request.skillLevel) {
        query = query.eq('difficulty', request.skillLevel);
      }

      // Apply pagination
      const limit = request.limit || 20;
      const offset = request.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by relevance (featured first, then by helpful votes)
      query = query.order('featured_order', { ascending: true, nullsLast: true })
                   .order('helpful_votes', { ascending: false });

      const { data: articles, error, count } = await query;

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      const searchTime = Date.now() - startTime;
      const mappedArticles = articles.map(article => this.mapDatabaseArticle(article));

      // Generate search suggestions and related topics
      const suggestions = await this.generateSearchSuggestions(request.query);
      const relatedTopics = await this.getRelatedTopics(request.query, request.category);

      return {
        articles: mappedArticles,
        totalCount: count || 0,
        searchTime,
        suggestions,
        relatedTopics
      };
    } catch (error) {
      console.error('Error searching articles:', error);
      const searchTime = Date.now() - startTime;
      return {
        articles: [],
        totalCount: 0,
        searchTime,
        suggestions: [],
        relatedTopics: []
      };
    }
  }

  /**
   * Retrieves a specific help article by ID
   */
  async getArticle(articleId: string): Promise<HelpArticle | null> {
    try {
      const { data: article, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('id', articleId)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Article not found
        }
        throw new Error(`Failed to retrieve article: ${error.message}`);
      }

      return this.mapDatabaseArticle(article);
    } catch (error) {
      console.error('Error retrieving article:', error);
      throw error;
    }
  }

  /**
   * Retrieves articles by category
   */
  async getCategoryArticles(category: string, skillLevel?: SkillLevel): Promise<HelpArticle[]> {
    try {
      let query = supabase
        .from('help_articles')
        .select('*')
        .eq('category', category)
        .eq('is_published', true);

      if (skillLevel) {
        query = query.eq('difficulty', skillLevel);
      }

      query = query.order('featured_order', { ascending: true, nullsLast: true })
                   .order('helpful_votes', { ascending: false });

      const { data: articles, error } = await query;

      if (error) {
        throw new Error(`Failed to retrieve category articles: ${error.message}`);
      }

      return articles.map(article => this.mapDatabaseArticle(article));
    } catch (error) {
      console.error('Error retrieving category articles:', error);
      throw error;
    }
  }

  /**
   * Retrieves featured articles for the homepage
   */
  async getFeaturedArticles(): Promise<HelpArticle[]> {
    try {
      const { data: articles, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('is_published', true)
        .not('featured_order', 'is', null)
        .order('featured_order', { ascending: true })
        .limit(6);

      if (error) {
        throw new Error(`Failed to retrieve featured articles: ${error.message}`);
      }

      return articles.map(article => this.mapDatabaseArticle(article));
    } catch (error) {
      console.error('Error retrieving featured articles:', error);
      return [];
    }
  }

  /**
   * Tracks when a user views an article (for analytics)
   */
  async trackArticleView(articleId: string, userId?: string): Promise<void> {
    try {
      // Insert view record
      await supabase
        .from('help_article_views')
        .insert({
          article_id: articleId,
          user_id: userId || null,
          viewed_at: new Date().toISOString()
        });

      // Increment view count
      await supabase
        .from('help_articles')
        .update({
          view_count: supabase.raw('view_count + 1')
        })
        .eq('id', articleId);
    } catch (error) {
      console.error('Error tracking article view:', error);
      // Don't throw error as this is non-critical
    }
  }

  /**
   * Allows users to vote on article helpfulness
   */
  async voteHelpful(articleId: string, userId: string, isHelpful: boolean): Promise<boolean> {
    try {
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from('help_article_votes')
        .select('*')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('help_article_votes')
          .update({ is_helpful: isHelpful })
          .eq('article_id', articleId)
          .eq('user_id', userId);

        if (error) {
          throw new Error(`Failed to update vote: ${error.message}`);
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('help_article_votes')
          .insert({
            article_id: articleId,
            user_id: userId,
            is_helpful: isHelpful
          });

        if (error) {
          throw new Error(`Failed to create vote: ${error.message}`);
        }
      }

      return true;
    } catch (error) {
      console.error('Error voting on article:', error);
      return false;
    }
  }

  /**
   * Gets related articles based on tags and category
   */
  async getRelatedArticles(articleId: string): Promise<HelpArticle[]> {
    try {
      // First get the current article to find its tags and category
      const { data: currentArticle } = await supabase
        .from('help_articles')
        .select('category, tags')
        .eq('id', articleId)
        .single();

      if (!currentArticle) {
        return [];
      }

      // Find articles with similar tags or same category
      const { data: relatedArticles, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('is_published', true)
        .neq('id', articleId)
        .or(`category.eq.${currentArticle.category},tags.ov.{${currentArticle.tags.join(',')}}`)
        .order('helpful_votes', { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(`Failed to retrieve related articles: ${error.message}`);
      }

      return relatedArticles.map(article => this.mapDatabaseArticle(article));
    } catch (error) {
      console.error('Error retrieving related articles:', error);
      return [];
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generates search suggestions based on query
   */
  private async generateSearchSuggestions(query?: string): Promise<string[]> {
    if (!query || query.length < 3) {
      return [];
    }

    try {
      // Get popular search terms from article titles and keywords
      const { data: articles } = await supabase
        .from('help_articles')
        .select('title, search_keywords')
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(20);

      if (!articles) {
        return [];
      }

      const suggestions = new Set<string>();
      const queryLower = query.toLowerCase();

      articles.forEach(article => {
        // Check title words
        const titleWords = article.title.toLowerCase().split(' ');
        titleWords.forEach(word => {
          if (word.includes(queryLower) && word !== queryLower) {
            suggestions.add(word);
          }
        });

        // Check keywords
        article.search_keywords?.forEach(keyword => {
          if (keyword.toLowerCase().includes(queryLower) && keyword.toLowerCase() !== queryLower) {
            suggestions.add(keyword);
          }
        });
      });

      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  /**
   * Gets related topics for search results
   */
  private async getRelatedTopics(query?: string, category?: string): Promise<string[]> {
    try {
      let dbQuery = supabase
        .from('help_articles')
        .select('category, tags')
        .eq('is_published', true);

      if (category) {
        dbQuery = dbQuery.eq('category', category);
      }

      const { data: articles } = await dbQuery.limit(50);

      if (!articles) {
        return [];
      }

      const topics = new Set<string>();

      articles.forEach(article => {
        // Add categories
        if (article.category && article.category !== category) {
          topics.add(article.category);
        }

        // Add popular tags
        article.tags?.forEach(tag => {
          if (tag && (!query || !tag.toLowerCase().includes(query.toLowerCase()))) {
            topics.add(tag);
          }
        });
      });

      return Array.from(topics).slice(0, 8);
    } catch (error) {
      console.error('Error getting related topics:', error);
      return [];
    }
  }

  /**
   * Maps database article to TypeScript interface
   */
  private mapDatabaseArticle(dbArticle: any): HelpArticle {
    return {
      id: dbArticle.id,
      title: dbArticle.title,
      content: dbArticle.content,
      category: dbArticle.category,
      tags: dbArticle.tags || [],
      difficulty: dbArticle.difficulty as SkillLevel,
      lastUpdated: new Date(dbArticle.updated_at),
      authorId: dbArticle.author_id,
      viewCount: dbArticle.view_count || 0,
      helpfulVotes: dbArticle.helpful_votes || 0,
      unhelpfulVotes: dbArticle.unhelpful_votes || 0,
      searchKeywords: dbArticle.search_keywords || [],
      relatedArticles: dbArticle.related_articles || [],
      isPublished: dbArticle.is_published,
      featuredOrder: dbArticle.featured_order
    };
  }
}