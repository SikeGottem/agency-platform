"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileFormData } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Camera, Loader2, Upload, X, Palette } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface SettingsFormProps {
  profile: {
    fullName: string;
    businessName: string;
    avatarUrl: string;
    email: string;
    planTier: string;
    userId: string;
    brandColor: string;
    brandLogoUrl: string;
  };
}

const PRESET_COLORS = [
  "#78716c", // stone-500
  "#292524", // stone-900
  "#7c3aed", // violet-600
  "#2563eb", // blue-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#db2777", // pink-600
];

export function SettingsForm({ profile }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [brandLogoUrl, setBrandLogoUrl] = useState(profile.brandLogoUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      businessName: profile.businessName,
      brandColor: profile.brandColor || "#78716c",
    },
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${profile.userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.getValues("fullName"),
          businessName: form.getValues("businessName"),
          avatarUrl: urlData.publicUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to update avatar");

      setAvatarUrl(newUrl);
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${profile.userId}/brand-logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.getValues("fullName"),
          businessName: form.getValues("businessName"),
          brandLogoUrl: urlData.publicUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to update logo");

      setBrandLogoUrl(newUrl);
      toast.success("Brand logo updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleRemoveLogo() {
    setUploadingLogo(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.getValues("fullName"),
          businessName: form.getValues("businessName"),
          brandLogoUrl: null,
        }),
      });

      if (!res.ok) throw new Error("Failed to remove logo");

      setBrandLogoUrl("");
      toast.success("Logo removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function onSubmit(data: UpdateProfileFormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const watchedColor = form.watch("brandColor") || "#78716c";

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Avatar Upload */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={profile.fullName} />
                ) : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-medium">{profile.fullName || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">
                Click the avatar to upload a new photo
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="fullName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="businessName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Your studio or agency name" />
                    </FormControl>
                    <FormDescription>
                      Shown to clients on questionnaire pages
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Plan</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {profile.planTier}
                </Badge>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Branding Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding
          </CardTitle>
          <CardDescription>
            Customize the look of client-facing questionnaire links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Logo */}
          <div>
            <label className="text-sm font-medium">Brand Logo</label>
            <p className="text-sm text-muted-foreground mb-3">
              Displayed on client questionnaires. Recommended: square, at least 200×200px.
            </p>
            {brandLogoUrl ? (
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-lg border overflow-hidden bg-muted">
                  <img
                    src={brandLogoUrl}
                    alt="Brand logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    disabled={uploadingLogo}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="flex h-20 w-full max-w-xs items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    Upload logo
                  </div>
                )}
              </button>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Brand Color */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                name="brandColor"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Color</FormLabel>
                    <FormDescription>
                      Used as the accent color on client questionnaires
                    </FormDescription>
                    <div className="flex items-center gap-3 mt-2">
                      <div
                        className="h-10 w-10 rounded-lg border shadow-sm cursor-pointer relative overflow-hidden"
                        style={{ backgroundColor: watchedColor }}
                      >
                        <input
                          type="color"
                          value={watchedColor}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                      <Input
                        {...field}
                        value={field.value ?? "#78716c"}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val);
                        }}
                        className="w-28 font-mono text-sm"
                        placeholder="#78716c"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={`h-7 w-7 rounded-full border-2 transition-all ${
                            watchedColor === color
                              ? "border-foreground scale-110"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview */}
              <div className="mt-6 rounded-lg border p-4 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground mb-3">PREVIEW</p>
                <div className="flex items-center gap-3 mb-3">
                  {brandLogoUrl ? (
                    <img src={brandLogoUrl} alt="" className="h-8 w-8 rounded object-contain" />
                  ) : (
                    <div
                      className="h-8 w-8 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: watchedColor }}
                    >
                      {(form.getValues("businessName") || "B")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-sm">
                    {form.watch("businessName") || "Your Business"}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full w-2/3"
                  style={{ backgroundColor: watchedColor }}
                />
                <div className="mt-3">
                  <button
                    type="button"
                    className="rounded-md px-4 py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: watchedColor }}
                  >
                    Continue
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="mt-6">
                {isLoading ? "Saving..." : "Save Branding"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
