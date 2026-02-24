import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { updateProfileSchema } from "@/lib/validations";

/**
 * Update the authenticated user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      full_name: result.data.fullName,
      business_name: result.data.businessName ?? null,
    };

    // Handle avatar URL if provided in the body
    if (body.avatarUrl !== undefined) {
      updateData.avatar_url = body.avatarUrl;
    }

    // Handle brand color
    if (result.data.brandColor !== undefined) {
      updateData.brand_color = result.data.brandColor;
    }

    // Handle brand logo URL
    if (body.brandLogoUrl !== undefined) {
      updateData.brand_logo_url = body.brandLogoUrl;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
