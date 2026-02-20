import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

interface AssetDeleteContext {
  params: Promise<{ projectId: string; assetId: string }>;
}

/**
 * Delete an uploaded asset
 */
export async function DELETE(
  _request: NextRequest,
  context: AssetDeleteContext
) {
  try {
    const { projectId, assetId } = await context.params;
    const supabase = createAdminClient();

    // Fetch the asset to get storage_path and verify it belongs to this project
    const { data: asset, error: fetchError } = await supabase
      .from("assets")
      .select("storage_path")
      .eq("id", assetId)
      .eq("project_id", projectId)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Delete from storage
    await supabase.storage
      .from("project-assets")
      .remove([asset.storage_path]);

    // Delete DB record
    const { error: deleteError } = await supabase
      .from("assets")
      .delete()
      .eq("id", assetId);

    if (deleteError) {
      console.error("Delete asset error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete asset" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
