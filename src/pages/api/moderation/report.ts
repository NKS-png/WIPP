import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response('Not authenticated', { status: 401 });
    }

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response('Invalid session', { status: 401 });
    }

    const {
      message_id,
      conversation_id,
      report_type,
      evidence_content,
      user_consented_to_decrypt,
      metadata
    } = await request.json();

    // Validate required fields
    if (!message_id || !conversation_id || !report_type) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Verify user is participant in the conversation
    const { data: participation } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversation_id)
      .eq('user_id', sessionData.session.user.id)
      .single();

    if (!participation) {
      return new Response('Unauthorized - not a conversation participant', { status: 403 });
    }

    // Create moderation report
    const { data: report, error } = await supabase
      .from('moderation_reports')
      .insert({
        reporter_id: sessionData.session.user.id,
        message_id: message_id,
        conversation_id: conversation_id,
        report_type: report_type,
        evidence_content: evidence_content || null,
        user_consented_to_decrypt: user_consented_to_decrypt || false,
        metadata: metadata || {},
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating moderation report:', error);
      return new Response('Failed to create report', { status: 500 });
    }

    // If user provided decrypted content, flag for priority review
    if (evidence_content && user_consented_to_decrypt) {
      await supabase
        .from('moderation_queue')
        .insert({
          report_id: report.id,
          priority: 'high',
          has_evidence: true,
          created_at: new Date().toISOString()
        });
    } else {
      // Use metadata-based analysis for encrypted reports
      const priority = await calculateReportPriority(metadata, report_type);
      
      await supabase
        .from('moderation_queue')
        .insert({
          report_id: report.id,
          priority: priority,
          has_evidence: false,
          created_at: new Date().toISOString()
        });
    }

    // Send notification to moderation team
    await notifyModerationTeam(report);

    return new Response(JSON.stringify({
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Moderation report API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

async function calculateReportPriority(metadata, reportType) {
  // Priority calculation based on metadata without seeing content
  let score = 0;
  
  // Report type severity
  const severityScores = {
    'harassment': 8,
    'threats': 10,
    'spam': 3,
    'inappropriate': 5,
    'other': 2
  };
  
  score += severityScores[reportType] || 2;
  
  // Metadata indicators
  if (metadata.message_length > 1000) score += 2; // Long messages
  if (metadata.has_attachments) score += 3; // Has attachments
  if (metadata.conversation_participant_count > 2) score += 1; // Group chat
  
  // Return priority level
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

async function notifyModerationTeam(report) {
  // Implementation would send notifications to moderation team
  // Could use email, Slack, or internal notification system
  console.log('Moderation report created:', report.id);
}