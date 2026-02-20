"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Copy, Share, Users } from "lucide-react";

interface TemplateShareDialogProps {
  templateId: string;
  templateName: string;
  projectType: string;
  isPublic?: boolean;
  children: React.ReactNode;
}

export function TemplateShareDialog({
  templateId,
  templateName,
  projectType,
  isPublic = false,
  children,
}: TemplateShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublicTemplate, setIsPublicTemplate] = useState(isPublic);
  const [shareDescription, setShareDescription] = useState("");
  const [shareCategory, setShareCategory] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/dashboard/templates/shared/${templateId}`;
  };

  async function handleShare() {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // Update template with sharing settings
      const { error } = await supabase
        .from("templates")
        .update({
          is_public: isPublicTemplate,
          share_description: shareDescription.trim() || null,
          share_category: shareCategory || null,
          share_tags: tags ? tags.split(",").map(t => t.trim()) : null,
          shared_at: isPublicTemplate ? new Date().toISOString() : null,
        })
        .eq("id", templateId);

      if (error) throw error;

      if (isPublicTemplate) {
        const url = generateShareUrl();
        setShareUrl(url);
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error sharing template:", error);
      setIsSubmitting(false);
      alert("Failed to update sharing settings. Please try again.");
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share Template
          </DialogTitle>
          <DialogDescription>
            Make your template available to other designers or generate a shareable link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Info */}
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{templateName}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {projectType.replace("_", " ")} Template
                </p>
              </div>
              {isPublicTemplate && (
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              )}
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Make Public</Label>
              <p className="text-xs text-muted-foreground">
                Allow other designers to discover and use this template
              </p>
            </div>
            <Switch
              checked={isPublicTemplate}
              onCheckedChange={setIsPublicTemplate}
            />
          </div>

          {isPublicTemplate && (
            <>
              {/* Share Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  placeholder="Describe what makes this template special..."
                  rows={3}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={shareCategory} onValueChange={setShareCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium Templates</SelectItem>
                    <SelectItem value="beginner">Beginner Friendly</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="specialized">Specialized</SelectItem>
                    <SelectItem value="minimal">Minimal & Clean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="startup, tech, modern, detailed (comma separated)"
                />
              </div>
            </>
          )}

          {/* Share URL (if template is/will be public) */}
          {(isPublicTemplate || shareUrl) && (
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={shareUrl || generateShareUrl()}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shareUrl || generateShareUrl())}
                  className="px-3"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {copySuccess && (
                <p className="text-xs text-green-600">✓ Copied to clipboard</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}