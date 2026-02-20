import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { Database } from "@/types/supabase";

type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

interface AssetRouteContext {
  params: Promise<{ projectId: string }>;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload an inspiration image
 */
export async function POST(request: NextRequest, context: AssetRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = createAdminClient();

    // Validate magic link token for anonymous access
    const magicToken = request.headers.get("x-magic-token");

    // Verify project exists and validate token if provided
    const projectQuery = supabase
      .from("projects")
      .select("id")
      .eq("id", projectId);

    if (magicToken) {
      projectQuery.eq("magic_link_token", magicToken);
    }

    const { data: project, error: projectError } = await projectQuery.single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: magicToken ? "Invalid magic link token" : "Project not found" },
        { status: magicToken ? 403 : 404 }
      );
    }
    // TODO: Add authentication check for logged-in users

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPEG, GIF, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `${projectId}/inspiration/${uniqueName}`;

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("project-assets")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Insert asset record
    const { data: asset, error: dbError } = await supabase
      .from("assets")
      .insert({
        project_id: projectId,
        storage_path: storagePath,
        file_name: file.name,
        file_type: file.type,
        category: "inspiration" as const,
      })
      .select()
      .returns<AssetRow[]>()
      .single();

    if (dbError) {
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from("project-assets").remove([storagePath]);
      console.error("DB insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save asset record" },
        { status: 500 }
      );
    }

    // Generate a signed URL (valid for 1 hour)
    const { data: signedUrlData } = await supabase.storage
      .from("project-assets")
      .createSignedUrl(storagePath, 3600);

    return NextResponse.json(
      {
        asset: {
          ...asset,
          url: signedUrlData?.signedUrl ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * List all inspiration assets for a project
 */
export async function GET(_request: NextRequest, context: AssetRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = createAdminClient();

    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("project_id", projectId)
      .eq("category", "inspiration")
      .order("uploaded_at", { ascending: true })
      .returns<AssetRow[]>();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch assets" },
        { status: 500 }
      );
    }

    // Generate signed URLs for all assets
    const assetsWithUrls = await Promise.all(
      (assets ?? []).map(async (asset) => {
        const { data } = await supabase.storage
          .from("project-assets")
          .createSignedUrl(asset.storage_path, 3600);
        return { ...asset, url: data?.signedUrl ?? null };
      })
    );

    return NextResponse.json({ assets: assetsWithUrls });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
