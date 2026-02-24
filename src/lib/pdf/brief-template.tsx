import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/* ── Design tokens ── */
const PRIMARY = "#E05252";
const STONE_900 = "#1c1917";
const STONE_700 = "#44403c";
const STONE_500 = "#78716c";
const STONE_400 = "#a8a29e";
const STONE_200 = "#e7e5e4";
const WARM_BG = "#FAF7F2";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 48,
    paddingBottom: 72,
    fontSize: 11,
    color: STONE_900,
    backgroundColor: "#FFFFFF",
  },
  // Hero header
  heroBox: {
    backgroundColor: WARM_BG,
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: STONE_200,
  },
  heroLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    color: STONE_400,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: STONE_900,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    color: STONE_500,
  },
  industryBadge: {
    marginTop: 12,
    backgroundColor: STONE_900,
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  heroDescription: {
    marginTop: 12,
    fontSize: 11,
    color: STONE_700,
    lineHeight: 1.6,
  },
  // Director summary
  summaryBox: {
    backgroundColor: STONE_900,
    borderRadius: 12,
    padding: 28,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    color: STONE_400,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 13,
    color: "#e7e5e4",
    lineHeight: 1.7,
    fontFamily: "Helvetica-Oblique",
  },
  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: STONE_900,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: STONE_200,
  },
  section: {
    marginBottom: 24,
  },
  // Cards
  card: {
    backgroundColor: WARM_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: STONE_200,
    padding: 16,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    color: STONE_400,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 11,
    color: STONE_700,
    lineHeight: 1.5,
  },
  cardValueLarge: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: STONE_900,
    textAlign: "center",
  },
  cardCenter: {
    backgroundColor: WARM_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: STONE_200,
    padding: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  // Style cards
  styleCard: {
    backgroundColor: WARM_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: STONE_200,
    padding: 14,
    marginBottom: 8,
  },
  styleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  styleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  styleName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: STONE_900,
  },
  styleTagline: {
    fontSize: 10,
    color: STONE_500,
    marginBottom: 6,
  },
  // Color swatches
  colorRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  colorSwatch: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
  },
  colorName: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  colorHex: {
    fontSize: 6,
    fontFamily: "Courier",
    opacity: 0.7,
  },
  // Typography preview
  typographyCard: {
    backgroundColor: WARM_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: STONE_200,
    padding: 16,
    marginBottom: 8,
  },
  typeSample: {
    fontSize: 20,
    color: STONE_900,
    marginTop: 4,
  },
  // Badges & tags
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  badge: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: STONE_200,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    color: STONE_700,
  },
  badgeKeyword: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: STONE_200,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 8,
    color: STONE_500,
  },
  badgeAvoid: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    color: "#dc2626",
  },
  avoidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  avoidLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: STONE_400,
    textTransform: "uppercase",
  },
  // List items
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  listDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  listDotMuted: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: STONE_400,
  },
  listText: {
    fontSize: 11,
    color: STONE_700,
  },
  // Priority numbers
  priorityNum: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: STONE_900,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityNumText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  // Grid helpers
  row: {
    flexDirection: "row",
    gap: 8,
  },
  col2: {
    flex: 1,
  },
  col3: {
    flex: 1,
  },
  // Final thoughts
  quoteBox: {
    backgroundColor: WARM_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: STONE_200,
    padding: 24,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 13,
    color: STONE_700,
    lineHeight: 1.7,
    fontFamily: "Helvetica-Oblique",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: STONE_200,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: STONE_400,
  },
  footerBrand: {
    fontSize: 8,
    color: PRIMARY,
    fontFamily: "Helvetica-Bold",
  },
});

/* ── Data lookups ── */

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

const FONT_STYLE_LABELS: Record<string, { label: string; sample: string }> = {
  serif: { label: "Serif", sample: "The quick brown fox jumps over the lazy dog" },
  "sans-serif": { label: "Sans Serif", sample: "The quick brown fox jumps over the lazy dog" },
  monospace: { label: "Monospace", sample: "The quick brown fox jumps over the lazy dog" },
  handwritten: { label: "Handwritten", sample: "The quick brown fox jumps over the lazy dog" },
  display: { label: "Display", sample: "The quick brown fox jumps over the lazy dog" },
  slab: { label: "Slab Serif", sample: "The quick brown fox jumps over the lazy dog" },
  script: { label: "Script", sample: "The quick brown fox jumps over the lazy dog" },
};

/* ── Helpers ── */

function contrastColor(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? STONE_900 : "#FFFFFF";
}

function generateDirectorSummary(content: BriefPDFProps["content"]): string | null {
  const r = content.responses;
  if (!r) return null;

  const parts: string[] = [];
  const name = r.business_info?.companyName || content.clientName || "The client";
  const industry = r.business_info?.industry;
  const styleSel = r.style_direction?.selectedStyles;
  const palettes = r.color_preferences?.selectedPalettes;
  const fonts = r.typography_feel?.fontStyles;
  const deliverables = r.project_scope?.deliverables;
  const timeline = r.timeline_budget?.timeline;
  const audience = r.business_info?.targetAudience;

  parts.push(`${name}${industry ? `, operating in the ${industry} space,` : ""} is looking for a design partner to bring their vision to life.`);

  if (styleSel && styleSel.length > 0) {
    const styleStr = styleSel.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" + ");
    parts.push(`The creative direction leans ${styleStr} — ${STYLE_DESCRIPTIONS[styleSel[0]]?.tagline || "a clear aesthetic vision"}.`);
  }

  if (palettes && palettes.length > 0) parts.push(`Color-wise, think ${palettes.join(", ")} tones.`);
  if (fonts && fonts.length > 0) parts.push(`Typography should feel ${fonts.map(f => f.replace(/-/g, " ")).join(" and ")}.`);
  if (audience && audience.length > 0) parts.push(`The work needs to resonate with ${audience.slice(0, 3).join(", ")} audiences.`);
  if (deliverables && deliverables.length > 0) parts.push(`Key deliverables include ${deliverables.slice(0, 4).join(", ")}.`);
  if (timeline) parts.push(`Timeline: ${TIMELINE_LABELS[timeline] || timeline}.`);

  return parts.length > 1 ? parts.join(" ") : null;
}

/* ── Types ── */

interface BriefPDFProps {
  content: {
    projectType?: string;
    clientName?: string;
    clientEmail?: string;
    submittedAt?: string;
    responses?: {
      business_info?: {
        companyName?: string;
        industry?: string;
        description?: string;
        targetAudience?: string[];
        competitors?: string[];
      };
      project_scope?: {
        deliverables?: string[];
        usageContexts?: string[];
        hasExistingAssets?: boolean;
      };
      style_direction?: {
        selectedStyles?: string[];
        antiInspiration?: string[];
      };
      color_preferences?: {
        selectedPalettes?: string[];
        avoidColors?: string[];
      };
      typography_feel?: {
        fontStyles?: string[];
        fontWeight?: string;
        additionalNotes?: string;
      };
      pages_functionality?: {
        selectedPages?: string[];
        customPages?: string[];
        functionality?: string[];
        referenceUrls?: string;
      };
      platforms_content?: {
        platforms?: string[];
        contentTypes?: string[];
        postingFrequency?: string;
        campaignGoal?: string;
      };
      inspiration_upload?: {
        urls?: string[];
        notes?: string;
      };
      timeline_budget?: {
        timeline?: string;
        budgetRange?: string;
        priorities?: string[];
      };
      final_thoughts?: {
        additionalNotes?: string;
      };
    };
    rawResponses?: unknown;
  };
}

/* ── Section Header component ── */
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

/* ── Main PDF Component ── */

export function BriefPDF({ content }: BriefPDFProps) {
  // Support both `responses` and `rawResponses` (generated briefs store under rawResponses)
  const raw = content as Record<string, unknown>;
  const r = (content.responses ?? (raw.rawResponses as BriefPDFProps["content"]["responses"]) ?? {}) as NonNullable<BriefPDFProps["content"]["responses"]>;

  const projectTypeLabel =
    content.projectType === "branding" ? "Branding"
    : content.projectType === "web_design" ? "Web Design"
    : content.projectType === "social_media" ? "Social Media"
    : content.projectType ?? "Project";

  const directorSummary = generateDirectorSummary({ ...content, responses: r });

  // Resolve palette names to actual colors
  const selectedColors = (r.color_preferences?.selectedPalettes ?? []).flatMap(
    (name) => PALETTE_DATA[name] ?? []
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Hero Header ── */}
        <View style={styles.heroBox}>
          <Text style={styles.heroLabel}>Creative Brief</Text>
          <Text style={styles.heroTitle}>
            {r.business_info?.companyName || content.clientName || "Untitled Project"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {content.clientName && r.business_info?.companyName ? `${content.clientName} · ` : ""}
            {projectTypeLabel}
            {content.submittedAt ? ` · ${new Date(content.submittedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}` : ""}
          </Text>
          {r.business_info?.industry && (
            <Text style={styles.industryBadge}>{r.business_info.industry}</Text>
          )}
          {r.business_info?.description && (
            <Text style={styles.heroDescription}>{r.business_info.description}</Text>
          )}
        </View>

        {/* ── Director's Summary ── */}
        {directorSummary && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Creative Director&apos;s Brief</Text>
            <Text style={styles.summaryText}>&ldquo;{directorSummary}&rdquo;</Text>
          </View>
        )}

        {/* ── Style Direction ── */}
        {r.style_direction?.selectedStyles && r.style_direction.selectedStyles.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Style Direction" />
            {r.style_direction.selectedStyles.map((style) => {
              const desc = STYLE_DESCRIPTIONS[style];
              return (
                <View key={style} style={styles.styleCard} wrap={false}>
                  <View style={styles.styleCardHeader}>
                    <View style={styles.styleDot} />
                    <Text style={styles.styleName}>{style.charAt(0).toUpperCase() + style.slice(1)}</Text>
                  </View>
                  {desc && (
                    <>
                      <Text style={styles.styleTagline}>{desc.tagline}</Text>
                      <View style={styles.badgeRow}>
                        {desc.keywords.map((kw) => (
                          <Text key={kw} style={styles.badgeKeyword}>{kw}</Text>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              );
            })}
            {r.style_direction.antiInspiration && r.style_direction.antiInspiration.length > 0 && (
              <View style={styles.avoidRow}>
                <Text style={styles.avoidLabel}>Avoid:</Text>
                {r.style_direction.antiInspiration.map((s) => (
                  <Text key={s} style={styles.badgeAvoid}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Color Palette ── */}
        {selectedColors.length > 0 && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Color Palette" />
            <View style={styles.colorRow}>
              {selectedColors.map((color) => (
                <View key={color.hex} style={{ alignItems: "center", marginBottom: 8 }}>
                  <View style={[styles.colorSwatch, { backgroundColor: color.hex }]}>
                    <Text style={[styles.colorName, { color: contrastColor(color.hex) }]}>{color.name}</Text>
                    <Text style={[styles.colorHex, { color: contrastColor(color.hex) }]}>{color.hex}</Text>
                  </View>
                </View>
              ))}
            </View>
            {r.color_preferences?.avoidColors && r.color_preferences.avoidColors.length > 0 && (
              <View style={styles.avoidRow}>
                <Text style={styles.avoidLabel}>Avoid:</Text>
                {r.color_preferences.avoidColors.map((c) => (
                  <Text key={c} style={styles.badgeAvoid}>{c}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Typography ── */}
        {r.typography_feel && (r.typography_feel.fontStyles?.length || r.typography_feel.fontWeight) && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Typography" />
            {r.typography_feel.fontStyles?.map((style) => {
              const font = FONT_STYLE_LABELS[style];
              // Use different PDF-available fonts to approximate the style
              const pdfFamily =
                style === "serif" ? "Times-Roman"
                : style === "monospace" ? "Courier"
                : style === "slab" ? "Courier-Bold"
                : "Helvetica";
              return (
                <View key={style} style={styles.typographyCard}>
                  <Text style={styles.cardLabel}>{font?.label || style.replace(/-/g, " ")}</Text>
                  <Text style={[styles.typeSample, { fontFamily: pdfFamily }]}>
                    {font?.sample || "The quick brown fox jumps over the lazy dog"}
                  </Text>
                </View>
              );
            })}
            {r.typography_feel.fontWeight && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Text style={styles.avoidLabel}>Weight preference:</Text>
                <Text style={styles.industryBadge}>{r.typography_feel.fontWeight.replace(/_/g, " ")}</Text>
              </View>
            )}
            {r.typography_feel.additionalNotes && (
              <Text style={{ fontSize: 10, color: STONE_500, fontFamily: "Helvetica-Oblique", marginTop: 8 }}>
                &ldquo;{r.typography_feel.additionalNotes}&rdquo;
              </Text>
            )}
          </View>
        )}

        {/* ── Brand & Audience ── */}
        {(r.business_info?.targetAudience?.length || r.business_info?.competitors?.length) && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Brand & Audience" />
            <View style={styles.row}>
              {r.business_info?.targetAudience && r.business_info.targetAudience.length > 0 && (
                <View style={[styles.card, styles.col2]}>
                  <Text style={styles.cardLabel}>Target Audience</Text>
                  <View style={styles.badgeRow}>
                    {r.business_info.targetAudience.map((a) => (
                      <Text key={a} style={styles.badge}>{a}</Text>
                    ))}
                  </View>
                </View>
              )}
              {r.business_info?.competitors && r.business_info.competitors.length > 0 && (
                <View style={[styles.card, styles.col2]}>
                  <Text style={styles.cardLabel}>Competitors & Inspiration</Text>
                  <View style={styles.badgeRow}>
                    {r.business_info.competitors.map((c) => (
                      <Text key={c} style={styles.badge}>{c}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Scope & Deliverables ── */}
        {r.project_scope && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Scope & Deliverables" />
            <View style={styles.row}>
              {r.project_scope.deliverables && r.project_scope.deliverables.length > 0 && (
                <View style={[styles.card, styles.col3]}>
                  <Text style={styles.cardLabel}>Deliverables</Text>
                  {r.project_scope.deliverables.map((d) => (
                    <View key={d} style={styles.listItem}>
                      <View style={styles.listDot} />
                      <Text style={styles.listText}>{d}</Text>
                    </View>
                  ))}
                </View>
              )}
              {r.project_scope.usageContexts && r.project_scope.usageContexts.length > 0 && (
                <View style={[styles.card, styles.col3]}>
                  <Text style={styles.cardLabel}>Usage</Text>
                  {r.project_scope.usageContexts.map((u) => (
                    <View key={u} style={styles.listItem}>
                      <View style={styles.listDotMuted} />
                      <Text style={styles.listText}>{u}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={[styles.card, styles.col3]}>
                <Text style={styles.cardLabel}>Existing Assets</Text>
                <Text style={styles.cardValue}>
                  {r.project_scope.hasExistingAssets ? "Yes — client has assets to work with" : "Starting fresh"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Pages & Functionality (Web) ── */}
        {r.pages_functionality && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Pages & Functionality" />
            <View style={styles.row}>
              {r.pages_functionality.selectedPages && r.pages_functionality.selectedPages.length > 0 && (
                <View style={[styles.card, styles.col2]}>
                  <Text style={styles.cardLabel}>Pages</Text>
                  <View style={styles.badgeRow}>
                    {r.pages_functionality.selectedPages.map((p) => (
                      <Text key={p} style={styles.badge}>{p.replace(/_/g, " ")}</Text>
                    ))}
                    {r.pages_functionality.customPages?.map((p) => (
                      <Text key={p} style={[styles.badge, { backgroundColor: `${PRIMARY}15`, borderColor: `${PRIMARY}30`, color: PRIMARY }]}>{p}</Text>
                    ))}
                  </View>
                </View>
              )}
              {r.pages_functionality.functionality && r.pages_functionality.functionality.length > 0 && (
                <View style={[styles.card, styles.col2]}>
                  <Text style={styles.cardLabel}>Functionality</Text>
                  <View style={styles.badgeRow}>
                    {r.pages_functionality.functionality.map((f) => (
                      <Text key={f} style={styles.badge}>{f.replace(/_/g, " ")}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
            {r.pages_functionality.referenceUrls && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.avoidLabel}>Reference Websites</Text>
                <Text style={[styles.cardValue, { marginTop: 4 }]}>{r.pages_functionality.referenceUrls}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Platforms & Content (Social) ── */}
        {r.platforms_content && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Platforms & Content" />
            <View style={styles.row}>
              {r.platforms_content.platforms && r.platforms_content.platforms.length > 0 && (
                <View style={[styles.card, styles.col2]}>
                  <Text style={styles.cardLabel}>Platforms</Text>
                  <View style={styles.badgeRow}>
                    {r.platforms_content.platforms.map((p) => (
                      <Text key={p} style={styles.badge}>{p.replace(/_/g, " ")}</Text>
                    ))}
                  </View>
                </View>
              )}
              <View style={[styles.card, styles.col2]}>
                {r.platforms_content.contentTypes && r.platforms_content.contentTypes.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.cardLabel}>Content Types</Text>
                    <View style={styles.badgeRow}>
                      {r.platforms_content.contentTypes.map((t) => (
                        <Text key={t} style={styles.badgeKeyword}>{t.replace(/_/g, " ")}</Text>
                      ))}
                    </View>
                  </View>
                )}
                {r.platforms_content.postingFrequency && (
                  <View style={{ marginBottom: 4 }}>
                    <Text style={styles.cardLabel}>Frequency</Text>
                    <Text style={styles.cardValue}>{r.platforms_content.postingFrequency.replace(/_/g, " ")}</Text>
                  </View>
                )}
                {r.platforms_content.campaignGoal && (
                  <View>
                    <Text style={styles.cardLabel}>Campaign Goal</Text>
                    <Text style={styles.cardValue}>{r.platforms_content.campaignGoal}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── Inspiration ── */}
        {r.inspiration_upload && (r.inspiration_upload.urls?.length || r.inspiration_upload.notes) && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Inspiration" />
            {r.inspiration_upload.urls && r.inspiration_upload.urls.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Reference Links</Text>
                {r.inspiration_upload.urls.map((url) => (
                  <Text key={url} style={{ fontSize: 10, color: PRIMARY, marginBottom: 3 }}>{url}</Text>
                ))}
              </View>
            )}
            {r.inspiration_upload.notes && (
              <Text style={{ fontSize: 10, color: STONE_500, fontFamily: "Helvetica-Oblique", marginTop: 4 }}>
                &ldquo;{r.inspiration_upload.notes}&rdquo;
              </Text>
            )}
          </View>
        )}

        {/* ── Timeline & Budget ── */}
        {r.timeline_budget && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Project Requirements" />
            <View style={styles.row}>
              {r.timeline_budget.timeline && (
                <View style={[styles.cardCenter, styles.col3]}>
                  <Text style={styles.cardLabel}>Timeline</Text>
                  <Text style={styles.cardValueLarge}>
                    {TIMELINE_LABELS[r.timeline_budget.timeline] ?? r.timeline_budget.timeline}
                  </Text>
                </View>
              )}
              {r.timeline_budget.budgetRange && (
                <View style={[styles.cardCenter, styles.col3]}>
                  <Text style={styles.cardLabel}>Budget</Text>
                  <Text style={styles.cardValueLarge}>
                    {BUDGET_LABELS[r.timeline_budget.budgetRange] ?? r.timeline_budget.budgetRange}
                  </Text>
                </View>
              )}
              {r.timeline_budget.priorities && r.timeline_budget.priorities.length > 0 && (
                <View style={[styles.card, styles.col3]}>
                  <Text style={styles.cardLabel}>Priorities</Text>
                  {r.timeline_budget.priorities.map((p, i) => (
                    <View key={p} style={[styles.listItem, { marginBottom: 6 }]}>
                      <View style={styles.priorityNum}>
                        <Text style={styles.priorityNumText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.listText}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Final Thoughts ── */}
        {r.final_thoughts?.additionalNotes && (
          <View style={styles.quoteBox} wrap={false}>
            <Text style={styles.heroLabel}>Client&apos;s Final Thoughts</Text>
            <Text style={styles.quoteText}>
              &ldquo;{r.final_thoughts.additionalNotes}&rdquo;
            </Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Briefed · {new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
          </Text>
          <Text style={styles.footerBrand}>briefed.co</Text>
        </View>
      </Page>
    </Document>
  );
}
