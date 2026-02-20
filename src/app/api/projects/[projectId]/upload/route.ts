import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeTokenCompare } from "@/lib/utils";

interface UploadRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Upload an inspiration image to Supabase Storage.
 * Access validated via magic_link_token.
 */
export async function POST(request: NextRequest, context: UploadRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = createAdminClient();

    // Validate access via token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Access token required" },
        { status: 401 }
      );
    }

    // Verify project and token
    const { data: project } = await supabase
      .from("projects")
      .select("id, magic_link_token")
      .eq("id", projectId)
      .single();

    if (!project || !project.magic_link_token || !timingSafeTokenCompare(project.magic_link_token, token)) {
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 403 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "inspiration";
    const note = (formData.get("note") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPG, GIF, WebP" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `${projectId}/${category}/${uniqueName}`;

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("project-assets")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Create asset record in database
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .insert({
        project_id: projectId,
        storage_path: storagePath,
        file_name: file.name,
        file_type: file.type,
        category: category as "inspiration" | "reference" | "existing_brand",
        metadata: {
          size: file.size,
          note,
          originalName: file.name,
        },
      })
      .select()
      .single();

    if (assetError) {
      console.error("Asset record error:", assetError);
      // Try to clean up the uploaded file
      await supabase.storage.from("project-assets").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to create asset record" },
        { status: 500 }
      );
    }

    // Get a signed URL for the uploaded file (valid for 1 hour)
    const { data: signedUrl } = await supabase.storage
      .from("project-assets")
      .createSignedUrl(storagePath, 3600);

    return NextResponse.json({
      asset: {
        ...asset,
        url: signedUrl?.signedUrl,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Delete an uploaded asset
 */
export async function DELETE(request: NextRequest, context: UploadRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = createAdminClient();

    // Validate access via token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const assetId = searchParams.get("assetId");

    if (!token) {
      return NextResponse.json(
        { error: "Access token required" },
        { status: 401 }
      );
    }

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID required" },
        { status: 400 }
      );
    }

    // Verify project and token
    const { data: project } = await supabase
      .from("projects")
      .select("id, magic_link_token")
      .eq("id", projectId)
      .single();

    if (!project || !project.magic_link_token || !timingSafeTokenCompare(project.magic_link_token, token)) {
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 403 }
      );
    }

    // Get the asset to find the storage path
    const { data: asset } = await supabase
      .from("assets")
      .select("storage_path")
      .eq("id", assetId)
      .eq("project_id", projectId)
      .single();

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    await supabase.storage.from("project-assets").remove([asset.storage_path]);

    // Delete the asset record
    await supabase
      .from("assets")
      .delete()
      .eq("id", assetId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
