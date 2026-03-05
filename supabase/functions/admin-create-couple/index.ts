import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const json = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Server configuration is missing" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: requester, error: requesterError } = await adminClient.auth.getUser(token);
    if (requesterError || !requester.user) {
      return json({ error: "Invalid session" }, 401);
    }

    const { data: requesterRoles, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requester.user.id);

    if (roleError) {
      return json({ error: "Unable to verify permissions" }, 500);
    }

    const isAdmin = requesterRoles?.some((role) => role.role === "admin");
    if (!isAdmin) {
      return json({ error: "Only admins can create couples" }, 403);
    }

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const fullName = String(body?.full_name ?? "").trim();
    const plan = body?.plan === "grand" ? "grand" : "starter";

    if (!email || !password || !fullName) {
      return json({ error: "Missing required fields" }, 400);
    }

    if (password.length < 6) {
      return json({ error: "Password must be at least 6 characters" }, 400);
    }

    const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createUserError || !createdUser.user) {
      return json({ error: createUserError?.message ?? "Unable to create account" }, 400);
    }

    const userId = createdUser.user.id;
    const maxGuests = plan === "grand" ? 9999 : 100;

    const [{ error: profileError }, { error: roleInsertError }, { error: weddingError }] = await Promise.all([
      adminClient.from("profiles").upsert({ user_id: userId, full_name: fullName }, { onConflict: "user_id" }),
      adminClient.from("user_roles").insert({ user_id: userId, role: "couple" }),
      adminClient.from("weddings").insert({
        user_id: userId,
        plan,
        max_guests: maxGuests,
        partner1_name: "",
        partner2_name: "",
      }),
    ]);

    if (profileError || roleInsertError || weddingError) {
      await adminClient.auth.admin.deleteUser(userId);
      return json(
        {
          error:
            profileError?.message || roleInsertError?.message || weddingError?.message || "Unable to setup account",
        },
        500,
      );
    }

    return json({ success: true, user_id: userId });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
