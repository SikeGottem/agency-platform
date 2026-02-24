"use client";

import type { Json } from "@/types/supabase";
import type { StructuredBrief, RedFlag, ExecutiveSummary, CreativeDirection, ScopeOfWork, ClientProfile } from "@/lib/brief-generator";

/* ── Constants ── */

const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP (1–2 weeks)",
  month: "Within a month",
  quarter: "Within 3 months",
  flexible: "Flexible / No rush",
};

const BUDGET_LABELS: Record<string, string> = {
  under_1k: "Under $1,000",
  "1k_3k": "$1,000 – $3,000",
  "3k_5k": "$3,000 – $5,000",
  "5k_10k": "$5,000 – $10,000",
  "10k_plus": "$10,000+",
  discuss: "Let's discuss",
};

const PALETTE_DATA: Record<string, { hex: string; name: string }[]> = {
  Ocean: [
    { hex: "#0077B6", name: "Deep Sea" },
    { hex: "#00B4D8", name: "Cyan" },
    { hex: "#90E0EF", name: "Sky" },
    { hex: "#CAF0F8", name: "Foam" },
  ],
  Sunset: [
    { hex: "#FF6B35", name: "Tangerine" },
    { hex: "#F7C59F", name: "Peach" },
    { hex: "#EFEFD0", name: "Cream" },
    { hex: "#004E89", name: "Navy" },
  ],
  Forest: [
    { hex: "#2D6A4F", name: "Pine" },
    { hex: "#40916C", name: "Sage" },
    { hex: "#52B788", name: "Fern" },
    { hex: "#D8F3DC", name: "Mint" },
  ],
  Midnight: [
    { hex: "#1B1B2F", name: "Abyss" },
    { hex: "#162447", name: "Ink" },
    { hex: "#1F4068", name: "Steel" },
    { hex: "#E43F5A", name: "Ruby" },
  ],
  Coral: [
    { hex: "#FF6F61", name: "Coral" },
    { hex: "#FFB5A7", name: "Blush" },
    { hex: "#FCD5CE", name: "Rose" },
    { hex: "#F8EDEB", name: "Shell" },
  ],
  Monochrome: [
    { hex: "#18181B", name: "Carbon" },
    { hex: "#3F3F46", name: "Ash" },
    { hex: "#71717A", name: "Stone" },
    { hex: "#D4D4D8", name: "Silver" },
  ],
  Lavender: [
    { hex: "#7C3AED", name: "Violet" },
    { hex: "#A78BFA", name: "Iris" },
    { hex: "#C4B5FD", name: "Lilac" },
    { hex: "#EDE9FE", name: "Mist" },
  ],
  Earth: [
    { hex: "#92400E", name: "Umber" },
    { hex: "#B45309", name: "Amber" },
    { hex: "#D97706", name: "Honey" },
    { hex: "#FDE68A", name: "Sand" },
  ],
};

const STYLE_DESCRIPTIONS: Record<string, { tagline: string; keywords: string[] }> = {
  minimalist: { tagline: "Less is more — clean, calm, intentional", keywords: ["Whitespace", "Simple", "Clean", "Restrained"] },
  bold: { tagline: "Make a statement — loud, confident, powerful", keywords: ["High-contrast", "Impactful", "Strong", "Dramatic"] },
  playful: { tagline: "Fun & vibrant — energetic, colorful, approachable", keywords: ["Bright", "Rounded", "Friendly", "Dynamic"] },
  elegant: { tagline: "The art of refinement — sophisticated, luxurious", keywords: ["Serif", "Refined", "Premium", "Classic"] },
  vintage: { tagline: "Timeless charm — retro, warm, nostalgic", keywords: ["Textured", "Warm", "Heritage", "Handcrafted"] },
  modern: { tagline: "Forward-thinking — sharp, contemporary, tech", keywords: ["Geometric", "Sleek", "Innovative", "Progressive"] },
  organic: { tagline: "Nature-inspired — flowing, earthy, human", keywords: ["Natural", "Textured", "Warm", "Flowing"] },
  geometric: { tagline: "Structure & pattern — precise, mathematical, balanced", keywords: ["Angular", "Systematic", "Grid", "Modular"] },
};

const FONT_STYLE_SAMPLES: Record<string, { family: string; label: string; sample: string }> = {
  serif: { family: "var(--font-display), 'Georgia', serif", label: "Serif", sample: "The quick brown fox jumps over the lazy dog" },
  "sans-serif": { family: "'Inter', system-ui, sans-serif", label: "Sans Serif", sample: "The quick brown fox jumps over the lazy dog" },
  monospace: { family: "'SF Mono', 'Fira Code', monospace", label: "Monospace", sample: "The quick brown fox jumps over the lazy dog" },
  handwritten: { family: "'Caveat', cursive", label: "Handwritten", sample: "The quick brown fox jumps over the lazy dog" },
  display: { family: "var(--font-display), serif", label: "Display", sample: "The quick brown fox jumps over the lazy dog" },
  slab: { family: "'Rockwell', 'Courier New', serif", label: "Slab Serif", sample: "The quick brown fox jumps over the lazy dog" },
};

/* ── Types ── */

interface BriefContentData {
  projectType?: string;
  clientName?: string;
  clientEmail?: string;
  submittedAt?: string;
  responses?: {
    business_info?: { companyName?: string; industry?: string; description?: string; targetAudience?: string[]; competitors?: string[] };
    project_scope?: { deliverables?: string[]; usageContexts?: string[]; hasExistingAssets?: boolean };
    pages_functionality?: { selectedPages?: string[]; customPages?: string[]; functionality?: string[]; referenceUrls?: string };
    platforms_content?: { platforms?: string[]; contentTypes?: string[]; postingFrequency?: string; campaignGoal?: string };
    style_direction?: { selectedStyles?: string[]; antiInspiration?: string[] };
    color_preferences?: { selectedPalettes?: string[]; avoidColors?: string[] };
    typography_feel?: { fontStyles?: string[]; fontWeight?: string; comparisons?: Record<string, string>; additionalNotes?: string };
    inspiration_upload?: { urls?: string[]; notes?: string; images?: { assetId: string; url: string; fileName: string; note?: string }[] };
    timeline_budget?: { timeline?: string; budgetRange?: string; priorities?: string[] };
    final_thoughts?: { additionalNotes?: string };
  };
}

interface ResponseRow {
  step_key: string;
  answers: Json;
}

interface BriefViewerProps {
  content: Json | null;
  projectId: string;
  assetUrls?: Record<string, string>;
  responses?: ResponseRow[];
}

/* ── Helper to determine text color on swatch ── */
function contrastColor(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#18181B" : "#FFFFFF";
}

/* ── Generate AI-style creative director summary ── */
function generateDirectorSummary(brief: BriefContentData): string | null {
  const r = brief.responses;
  if (!r) return null;

  const parts: string[] = [];
  const name = r.business_info?.companyName || brief.clientName || "The client";
  const industry = r.business_info?.industry;
  const styles = r.style_direction?.selectedStyles;
  const palettes = r.color_preferences?.selectedPalettes;
  const fonts = r.typography_feel?.fontStyles;
  const deliverables = r.project_scope?.deliverables;
  const timeline = r.timeline_budget?.timeline;
  const audience = r.business_info?.targetAudience;

  parts.push(`${name}${industry ? `, operating in the ${industry} space,` : ""} is looking for a design partner to bring their vision to life.`);

  if (styles && styles.length > 0) {
    const styleStr = styles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" + ");
    parts.push(`The creative direction leans ${styleStr} — ${STYLE_DESCRIPTIONS[styles[0]]?.tagline || "a clear aesthetic vision"}.`);
  }

  if (palettes && palettes.length > 0) {
    parts.push(`Color-wise, think ${palettes.join(", ")} tones.`);
  }

  if (fonts && fonts.length > 0) {
    parts.push(`Typography should feel ${fonts.map(f => f.replace(/-/g, " ")).join(" and ")}.`);
  }

  if (audience && audience.length > 0) {
    parts.push(`The work needs to resonate with ${audience.slice(0, 3).join(", ")} audiences.`);
  }

  if (deliverables && deliverables.length > 0) {
    parts.push(`Key deliverables include ${deliverables.slice(0, 4).join(", ")}.`);
  }

  if (timeline) {
    parts.push(`Timeline: ${TIMELINE_LABELS[timeline] || timeline}.`);
  }

  if (r.final_thoughts?.additionalNotes) {
    parts.push(`In their own words: "${r.final_thoughts.additionalNotes}"`);
  }

  return parts.length > 1 ? parts.join(" ") : null;
}

/* ── Component ── */

/** Build a BriefContentData from raw response rows when no generated brief exists */
function buildContentFromResponses(responses: ResponseRow[]): BriefContentData {
  const mapped: Record<string, Json> = {};
  for (const row of responses) {
    mapped[row.step_key] = row.answers;
  }
  return { responses: mapped as unknown as BriefContentData["responses"] };
}

export function BriefViewer({ content, assetUrls, responses }: BriefViewerProps) {
  // The generated brief stores questionnaire data under `rawResponses`, not `responses`
  const rawContent = content as Record<string, unknown> | null;
  const isV3 = rawContent?.version === 3;
  const v3Brief = isV3 ? (rawContent as unknown as StructuredBrief) : null;
  const brief: BriefContentData = rawContent
    ? {
        ...rawContent,
        responses: (rawContent.rawResponses ?? rawContent.responses ?? {}) as BriefContentData["responses"],
      } as BriefContentData
    : responses && responses.length > 0
      ? buildContentFromResponses(responses)
      : ({} as BriefContentData);
  const r = brief.responses ?? {};

  const directorSummary = generateDirectorSummary(brief);

  // Collect all selected palette colors for display
  const selectedColors = (r.color_preferences?.selectedPalettes ?? []).flatMap(
    (name) => PALETTE_DATA[name] ?? []
  );

  return (
    <div className="print:bg-white">
      {/* ── Hero Header ── */}
      <section className="relative overflow-hidden rounded-2xl bg-[#FAF7F2] border border-stone-200/60 p-8 md:p-12 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E05252]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-3">Creative Brief</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-stone-900 mb-2">
            {r.business_info?.companyName || brief.clientName || "Untitled Project"}
          </h1>
          <p className="text-stone-500 text-sm">
            {brief.clientName && r.business_info?.companyName ? `${brief.clientName} · ` : ""}
            {brief.submittedAt ? new Date(brief.submittedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" }) : "Recently submitted"}
          </p>
          {r.business_info?.industry && (
            <span className="inline-block mt-4 px-3 py-1 text-xs font-medium bg-stone-900 text-white rounded-full">
              {r.business_info.industry}
            </span>
          )}
          {r.business_info?.description && (
            <p className="mt-4 text-stone-600 leading-relaxed max-w-2xl">{r.business_info.description}</p>
          )}
        </div>
      </section>

      {/* ── Director&apos;s Summary ── */}
      {directorSummary && (
        <section className="mb-8 rounded-2xl bg-stone-900 text-white p-8 md:p-10">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-4">Creative Director&apos;s Brief</p>
          <p className="font-[family-name:var(--font-display)] text-lg md:text-xl leading-relaxed text-stone-100 italic">
            &ldquo;{directorSummary}&rdquo;
          </p>
        </section>
      )}

      {/* ── V3 Structured Sections ── */}
      {v3Brief && (
        <>
          <ExecutiveSummarySection data={v3Brief.executiveSummary} confidenceScore={v3Brief.confidenceScore} />
          <CreativeDirectionSection data={v3Brief.creativeDirection} />
          <ScopeOfWorkSection data={v3Brief.scopeOfWork} />
          <ClientProfileSection data={v3Brief.clientProfile} />
          <RedFlagsSection flags={v3Brief.redFlags} />
        </>
      )}

      {/* ── Style Direction ── */}
      {r.style_direction?.selectedStyles && r.style_direction.selectedStyles.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Style Direction" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {r.style_direction.selectedStyles.map((style) => {
              const desc = STYLE_DESCRIPTIONS[style];
              return (
                <div key={style} className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#E05252]" />
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold capitalize text-stone-900">{style}</h3>
                  </div>
                  {desc && (
                    <>
                      <p className="text-sm text-stone-500 mb-3">{desc.tagline}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {desc.keywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 text-[11px] font-medium bg-white border border-stone-200 rounded-full text-stone-600">{kw}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {r.style_direction.antiInspiration && r.style_direction.antiInspiration.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Avoid:</span>
              {r.style_direction.antiInspiration.map((s) => (
                <span key={s} className="px-2.5 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-full capitalize">{s}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Color Palette ── */}
      {selectedColors.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Color Palette" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedColors.map((color) => (
              <div key={color.hex} className="group">
                <div
                  className="aspect-square rounded-xl shadow-sm flex flex-col items-center justify-end p-3 transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: color.hex, color: contrastColor(color.hex) }}
                >
                  <span className="text-sm font-semibold opacity-90">{color.name}</span>
                  <span className="text-[11px] font-mono opacity-70">{color.hex}</span>
                </div>
              </div>
            ))}
          </div>
          {r.color_preferences?.avoidColors && r.color_preferences.avoidColors.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Avoid:</span>
              {r.color_preferences.avoidColors.map((c) => (
                <span key={c} className="px-2.5 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-full">{c}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Typography ── */}
      {r.typography_feel && (r.typography_feel.fontStyles?.length || r.typography_feel.fontWeight) && (
        <section className="mb-8">
          <SectionHeader title="Typography" />
          <div className="grid grid-cols-1 gap-4">
            {r.typography_feel.fontStyles?.map((style) => {
              const font = FONT_STYLE_SAMPLES[style];
              return (
                <div key={style} className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                  <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-2">{font?.label || style.replace(/-/g, " ")}</p>
                  <p
                    className="text-2xl md:text-3xl text-stone-900 leading-snug"
                    style={{ fontFamily: font?.family || "inherit" }}
                  >
                    {font?.sample || "The quick brown fox jumps over the lazy dog"}
                  </p>
                </div>
              );
            })}
            {r.typography_feel.fontWeight && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Weight preference:</span>
                <span className="px-3 py-1 text-sm font-medium bg-stone-900 text-white rounded-full capitalize">{r.typography_feel.fontWeight.replace(/_/g, " ")}</span>
              </div>
            )}
            {r.typography_feel.additionalNotes && (
              <p className="text-sm text-stone-500 italic">&ldquo;{r.typography_feel.additionalNotes}&rdquo;</p>
            )}
          </div>
        </section>
      )}

      {/* ── Inspiration / Moodboard ── */}
      {r.inspiration_upload && (r.inspiration_upload.images?.length || r.inspiration_upload.urls?.length || r.inspiration_upload.notes) && (
        <section className="mb-8">
          <SectionHeader title="Moodboard" />
          {r.inspiration_upload.images && r.inspiration_upload.images.length > 0 && (
            <div className="columns-2 sm:columns-3 gap-3 space-y-3">
              {r.inspiration_upload.images.map((img) => {
                const imgUrl = assetUrls?.[img.assetId] ?? img.url;
                return (
                  <div key={img.assetId} className="break-inside-avoid">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={img.fileName}
                      className="w-full rounded-xl object-cover"
                    />
                    {img.note && (
                      <p className="mt-1 text-xs text-stone-400 px-1">{img.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {r.inspiration_upload.urls && r.inspiration_upload.urls.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Reference Links</p>
              {r.inspiration_upload.urls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-[#E05252] underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                >
                  {url}
                </a>
              ))}
            </div>
          )}
          {r.inspiration_upload.notes && (
            <p className="mt-4 text-sm text-stone-500 italic">&ldquo;{r.inspiration_upload.notes}&rdquo;</p>
          )}
        </section>
      )}

      {/* ── Brand Values / Target Audience ── */}
      {(r.business_info?.targetAudience?.length || r.business_info?.competitors?.length) && (
        <section className="mb-8">
          <SectionHeader title="Brand & Audience" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {r.business_info?.targetAudience && r.business_info.targetAudience.length > 0 && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Target Audience</p>
                <div className="flex flex-wrap gap-2">
                  {r.business_info.targetAudience.map((a) => (
                    <span key={a} className="px-3 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-full text-stone-700">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {r.business_info?.competitors && r.business_info.competitors.length > 0 && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Competitors & Inspiration</p>
                <div className="flex flex-wrap gap-2">
                  {r.business_info.competitors.map((c) => (
                    <span key={c} className="px-3 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-full text-stone-700">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Project Scope & Deliverables ── */}
      {r.project_scope && (
        <section className="mb-8">
          <SectionHeader title="Scope & Deliverables" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {r.project_scope.deliverables && r.project_scope.deliverables.length > 0 && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Deliverables</p>
                <ul className="space-y-1.5">
                  {r.project_scope.deliverables.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-stone-700">
                      <span className="w-1 h-1 rounded-full bg-[#E05252]" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {r.project_scope.usageContexts && r.project_scope.usageContexts.length > 0 && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Usage</p>
                <ul className="space-y-1.5">
                  {r.project_scope.usageContexts.map((u) => (
                    <li key={u} className="flex items-center gap-2 text-sm text-stone-700">
                      <span className="w-1 h-1 rounded-full bg-stone-400" />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
              <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Existing Assets</p>
              <p className="text-sm text-stone-700">{r.project_scope.hasExistingAssets ? "Yes — client has assets to work with" : "Starting fresh"}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Pages & Functionality (Web) ── */}
      {r.pages_functionality && (
        <section className="mb-8">
          <SectionHeader title="Pages & Functionality" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {r.pages_functionality.selectedPages && r.pages_functionality.selectedPages.length > 0 && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Pages</p>
                <div className="flex flex-wrap gap-2">
                  {r.pages_functionality.selectedPages.map((p) => (
                    <span key={p} className="px-3 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-full text-stone-700 capitalize">{p.replace(/_/g, " ")}</span>
                  ))}
                  {r.pages_functionality.customPages?.map((p) => (
                    <span key={p} className="px-3 py-1.5 text-sm font-medium bg-[#E05252]/10 border border-[#E05252]/20 rounded-full text-[#E05252]">{p}</span>
                  ))}
                </div>
              </div>
            )}
            {r.pages_functionality.functionality && r.pages_functionality.functionality.length > 0 && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Functionality</p>
                <div className="flex flex-wrap gap-2">
                  {r.pages_functionality.functionality.map((f) => (
                    <span key={f} className="px-3 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-full text-stone-700 capitalize">{f.replace(/_/g, " ")}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {r.pages_functionality.referenceUrls && (
            <div className="mt-4">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Reference Websites</p>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{r.pages_functionality.referenceUrls}</p>
            </div>
          )}
        </section>
      )}

      {/* ── Platforms & Content (Social) ── */}
      {r.platforms_content && (
        <section className="mb-8">
          <SectionHeader title="Platforms & Content" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {r.platforms_content.platforms && r.platforms_content.platforms.length > 0 && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {r.platforms_content.platforms.map((p) => (
                    <span key={p} className="px-3 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-full text-stone-700 capitalize">{p.replace(/_/g, " ")}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6 space-y-3">
              {r.platforms_content.contentTypes && r.platforms_content.contentTypes.length > 0 && (
                <div>
                  <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-2">Content Types</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.platforms_content.contentTypes.map((t) => (
                      <span key={t} className="px-2 py-0.5 text-xs bg-white border border-stone-200 rounded-full text-stone-600 capitalize">{t.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                </div>
              )}
              {r.platforms_content.postingFrequency && (
                <div>
                  <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-1">Frequency</p>
                  <p className="text-sm text-stone-700 capitalize">{r.platforms_content.postingFrequency.replace(/_/g, " ")}</p>
                </div>
              )}
              {r.platforms_content.campaignGoal && (
                <div>
                  <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-1">Campaign Goal</p>
                  <p className="text-sm text-stone-700">{r.platforms_content.campaignGoal}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Timeline & Budget ── */}
      {r.timeline_budget && (
        <section className="mb-8">
          <SectionHeader title="Project Requirements" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {r.timeline_budget.timeline && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6 text-center">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-2">Timeline</p>
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900">
                  {TIMELINE_LABELS[r.timeline_budget.timeline] ?? r.timeline_budget.timeline}
                </p>
              </div>
            )}
            {r.timeline_budget.budgetRange && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6 text-center">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-2">Budget</p>
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900">
                  {BUDGET_LABELS[r.timeline_budget.budgetRange] ?? r.timeline_budget.budgetRange}
                </p>
              </div>
            )}
            {r.timeline_budget.priorities && r.timeline_budget.priorities.length > 0 && (
              <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-2">Priorities</p>
                <ol className="space-y-1">
                  {r.timeline_budget.priorities.map((p, i) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-stone-700">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Additional Notes ── */}
      {r.final_thoughts?.additionalNotes && (
        <section className="mb-8 rounded-2xl border border-stone-200/60 bg-[#FAF7F2] p-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-3">Client&apos;s Final Thoughts</p>
          <p className="font-[family-name:var(--font-display)] text-lg text-stone-700 leading-relaxed italic">
            &ldquo;{r.final_thoughts.additionalNotes}&rdquo;
          </p>
        </section>
      )}

      {/* ── Print footer ── */}
      <div className="hidden print:block text-center text-xs text-stone-400 mt-12 pt-6 border-t border-stone-200">
        Generated by Briefed · {new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">{title}</h2>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  );
}

/* ── V3 Structured Sections ── */

function ExecutiveSummarySection({ data, confidenceScore }: { data: ExecutiveSummary; confidenceScore: string }) {
  const gradeColors: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-200",
    B: "bg-amber-100 text-amber-800 border-amber-200",
    C: "bg-red-100 text-red-800 border-red-200",
  };
  const gradeLabels: Record<string, string> = {
    A: "Well-defined brief",
    B: "Some areas need clarification",
    C: "Needs significant follow-up",
  };

  return (
    <section className="mb-8 rounded-2xl border-2 border-[#E05252]/20 bg-gradient-to-br from-[#FAF7F2] to-white p-8 md:p-10">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-2">Executive Summary</p>
        </div>
        <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${gradeColors[confidenceScore] || gradeColors.B}`}>
          Grade {confidenceScore} — {gradeLabels[confidenceScore] || ""}
        </div>
      </div>
      <p className="text-stone-700 leading-relaxed text-base mb-6">{data.overview}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-xl bg-white border border-stone-200/60">
          <p className="text-xs font-medium tracking-wider uppercase text-stone-400 mb-1">Deliverables</p>
          <p className="text-2xl font-bold text-stone-900">{data.keyDeliverables.length || "TBD"}</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-white border border-stone-200/60">
          <p className="text-xs font-medium tracking-wider uppercase text-stone-400 mb-1">Timeline</p>
          <p className="text-lg font-semibold text-stone-900">{data.timeline}</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-white border border-stone-200/60">
          <p className="text-xs font-medium tracking-wider uppercase text-stone-400 mb-1">Budget</p>
          <p className="text-lg font-semibold text-stone-900">{data.budget}</p>
        </div>
      </div>
    </section>
  );
}

function CreativeDirectionSection({ data }: { data: CreativeDirection }) {
  return (
    <section className="mb-8">
      <SectionHeader title="Creative Direction" />
      
      {/* Style Profile */}
      <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6 mb-4">
        <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Style Profile</p>
        <p className="text-stone-700 leading-relaxed">{data.styleProfile}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Mood Keywords */}
        {data.moodKeywords.length > 0 && (
          <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Mood & Tone</p>
            <div className="flex flex-wrap gap-2">
              {data.moodKeywords.map(kw => (
                <span key={kw} className="px-3 py-1.5 text-sm font-medium bg-stone-900 text-white rounded-full">{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* Avoid */}
        {data.avoidKeywords.length > 0 && (
          <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-6">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-red-400 mb-3">Avoid</p>
            <div className="flex flex-wrap gap-2">
              {data.avoidKeywords.map(kw => (
                <span key={kw} className="px-3 py-1.5 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-full">{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Font Recommendations */}
      {data.fontRecommendations.length > 0 && (
        <div className="space-y-3 mb-4">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400">Font Recommendations</p>
          {data.fontRecommendations.map(font => (
            <div key={font.category} className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="shrink-0">
                <span className="px-3 py-1 text-xs font-semibold bg-[#E05252] text-white rounded-full capitalize">{font.category}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">{font.suggestion}</p>
                <p className="text-xs text-stone-500">{font.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Color Palette with Roles */}
      {data.colorPalette.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Color Palette</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.colorPalette.map(color => (
              <div key={color.hex + color.name} className="group">
                <div
                  className="aspect-[4/3] rounded-xl shadow-sm flex flex-col items-center justify-end p-3 transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: color.hex, color: contrastColor(color.hex) }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">{color.role}</span>
                  <span className="text-sm font-semibold opacity-90">{color.name}</span>
                  <span className="text-[11px] font-mono opacity-70">{color.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ScopeOfWorkSection({ data }: { data: ScopeOfWork }) {
  return (
    <section className="mb-8">
      <SectionHeader title="Scope of Work" />

      {/* Deliverables */}
      {data.deliverables.length > 0 && (
        <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6 mb-4">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-4">Deliverables</p>
          <div className="space-y-3">
            {data.deliverables.map((d, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-stone-200/40 last:border-0 last:pb-0">
                <span className="w-6 h-6 rounded-full bg-[#E05252] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{d.item}</p>
                  <p className="text-xs text-stone-500">{d.specification}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Inclusions */}
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-6">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-emerald-600 mb-3">What&apos;s Included</p>
          <ul className="space-y-2">
            {data.inclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        <div className="rounded-xl border border-stone-200/60 bg-stone-50 p-6">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Not Included</p>
          <ul className="space-y-2">
            {data.exclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-500">
                <span className="text-stone-400 mt-0.5">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Revision rounds */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Revision Rounds:</span>
        <span className="px-3 py-1 text-sm font-semibold bg-stone-900 text-white rounded-full">{data.revisionRounds}</span>
      </div>

      {/* Timeline Milestones */}
      {data.milestones.length > 0 && (
        <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-4">Timeline & Milestones</p>
          <div className="space-y-0">
            {data.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-4 relative pb-6 last:pb-0">
                {/* Timeline line */}
                {i < data.milestones.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-px bg-stone-300" />
                )}
                <div className="w-6 h-6 rounded-full border-2 border-[#E05252] bg-white flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-[#E05252]" />
                </div>
                <div className="flex-1 -mt-0.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-stone-900">{m.phase}</p>
                    <span className="text-xs text-[#E05252] font-medium">{m.weekRange}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ClientProfileSection({ data }: { data: ClientProfile }) {
  return (
    <section className="mb-8">
      <SectionHeader title="Client Profile" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Business */}
        <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6 sm:col-span-2">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-2">Business Description</p>
          <p className="text-sm text-stone-700 leading-relaxed">{data.businessDescription}</p>
          {data.industry !== "Not specified" && (
            <span className="inline-block mt-3 px-3 py-1 text-xs font-medium bg-stone-900 text-white rounded-full">{data.industry}</span>
          )}
        </div>

        {/* Target Audience */}
        {data.targetAudience.length > 0 && (
          <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Target Audience</p>
            <div className="flex flex-wrap gap-2">
              {data.targetAudience.map(a => (
                <span key={a} className="px-3 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-full text-stone-700">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Competitors */}
        {data.competitors.length > 0 && (
          <div className="rounded-xl border border-stone-200/60 bg-[#FAF7F2] p-6">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400 mb-3">Competitors</p>
            <div className="flex flex-wrap gap-2">
              {data.competitors.map(c => (
                <span key={c} className="px-3 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-full text-stone-700">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Likes */}
        {data.likes.length > 0 && (
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-6">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-emerald-600 mb-3">What They Like</p>
            <div className="flex flex-wrap gap-2">
              {data.likes.map(l => (
                <span key={l} className="px-3 py-1.5 text-sm font-medium bg-white border border-emerald-200 rounded-full text-emerald-700">{l}</span>
              ))}
            </div>
          </div>
        )}

        {/* Dislikes */}
        {data.dislikes.length > 0 && (
          <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-6">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-red-400 mb-3">What They Dislike</p>
            <div className="flex flex-wrap gap-2">
              {data.dislikes.map(d => (
                <span key={d} className="px-3 py-1.5 text-sm font-medium bg-white border border-red-200 rounded-full text-red-600">{d}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RedFlagsSection({ flags }: { flags: RedFlag[] }) {
  if (flags.length === 0) return null;

  const severityConfig: Record<string, { bg: string; border: string; icon: string; label: string }> = {
    critical: { bg: "bg-red-50", border: "border-red-200", icon: "🚨", label: "Critical" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "⚠️", label: "Warning" },
    info: { bg: "bg-blue-50", border: "border-blue-200", icon: "💡", label: "Note" },
  };

  return (
    <section className="mb-8">
      <SectionHeader title="Red Flags & Notes" />
      <div className="space-y-3">
        {flags.map((flag, i) => {
          const config = severityConfig[flag.severity] || severityConfig.info;
          return (
            <div key={i} className={`rounded-xl border ${config.border} ${config.bg} p-5`}>
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">{config.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      flag.severity === "critical" ? "text-red-600" : 
                      flag.severity === "warning" ? "text-amber-600" : "text-blue-600"
                    }`}>{config.label}</span>
                  </div>
                  <p className="text-sm font-medium text-stone-800">{flag.message}</p>
                  <p className="text-xs text-stone-500 mt-1">→ {flag.recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
