import { s as supabase } from '../../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken || !refreshToken) {
      return new Response("Not authenticated", { status: 401 });
    }
    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (!sessionData.session) {
      return new Response("Invalid session", { status: 401 });
    }
    const {
      message_id,
      conversation_id,
      report_type,
      evidence_content,
      user_consented_to_decrypt,
      metadata
    } = await request.json();
    if (!message_id || !conversation_id || !report_type) {
      return new Response("Missing required fields", { status: 400 });
    }
    const { data: participation } = await supabase.from("conversation_participants").select("id").eq("conversation_id", conversation_id).eq("user_id", sessionData.session.user.id).single();
    if (!participation) {
      return new Response("Unauthorized - not a conversation participant", { status: 403 });
    }
    const { data: report, error } = await supabase.from("moderation_reports").insert({
      reporter_id: sessionData.session.user.id,
      message_id,
      conversation_id,
      report_type,
      evidence_content: evidence_content || null,
      user_consented_to_decrypt: user_consented_to_decrypt || false,
      metadata: metadata || {},
      status: "pending",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) {
      console.error("Error creating moderation report:", error);
      return new Response("Failed to create report", { status: 500 });
    }
    if (evidence_content && user_consented_to_decrypt) {
      await supabase.from("moderation_queue").insert({
        report_id: report.id,
        priority: "high",
        has_evidence: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      const priority = await calculateReportPriority(metadata, report_type);
      await supabase.from("moderation_queue").insert({
        report_id: report.id,
        priority,
        has_evidence: false,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    await notifyModerationTeam(report);
    return new Response(JSON.stringify({
      success: true,
      reportId: report.id,
      message: "Report submitted successfully"
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Moderation report API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
async function calculateReportPriority(metadata, reportType) {
  let score = 0;
  const severityScores = {
    "harassment": 8,
    "threats": 10,
    "spam": 3,
    "inappropriate": 5,
    "other": 2
  };
  score += severityScores[reportType] || 2;
  if (metadata.message_length > 1e3) score += 2;
  if (metadata.has_attachments) score += 3;
  if (metadata.conversation_participant_count > 2) score += 1;
  if (score >= 8) return "high";
  if (score >= 5) return "medium";
  return "low";
}
async function notifyModerationTeam(report) {
  console.log("Moderation report created:", report.id);
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
