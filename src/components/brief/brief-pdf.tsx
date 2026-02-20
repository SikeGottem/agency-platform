import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const PRIMARY = "#E05252";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 48,
    fontSize: 11,
    color: "#18181B",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 28,
    borderBottomWidth: 3,
    borderBottomColor: PRIMARY,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  logo: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  dateBadge: {
    fontSize: 9,
    color: "#71717A",
    backgroundColor: "#F4F4F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#18181B",
  },
  subtitle: {
    fontSize: 12,
    color: "#71717A",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    color: "#18181B",
    backgroundColor: "#FAF7F2",
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY,
  },
  fieldRow: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  fieldLabel: {
    fontSize: 9,
    color: "#71717A",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
    fontFamily: "Helvetica-Bold",
  },
  fieldValue: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 3,
  },
  badge: {
    backgroundColor: "#F4F4F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  colorRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 10,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  colorLabel: {
    fontSize: 8,
    color: "#71717A",
    textAlign: "center",
    marginTop: 3,
    fontFamily: "Courier",
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E4E7",
    marginVertical: 16,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#A1A1AA",
  },
  footerBrand: {
    fontSize: 8,
    color: PRIMARY,
    fontFamily: "Helvetica-Bold",
  },
});

const STEP_LABELS: Record<string, string> = {
  welcome: "Welcome",
  business_info: "Business Info",
  project_scope: "Project Scope",
  style_direction: "Style Direction",
  color_preferences: "Color Preferences",
  typography_feel: "Typography",
  pages_functionality: "Pages & Functionality",
  platforms_content: "Platforms & Content",
  inspiration_upload: "Inspiration",
  timeline_budget: "Timeline & Budget",
  final_thoughts: "Final Thoughts",
  custom_questions: "Additional Questions",
};

const STEP_ORDER = [
  "welcome",
  "business_info",
  "project_scope",
  "style_direction",
  "color_preferences",
  "typography_feel",
  "pages_functionality",
  "platforms_content",
  "inspiration_upload",
  "timeline_budget",
  "final_thoughts",
  "custom_questions",
];

function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value || "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function isHexColor(s: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
}

interface BriefPDFProps {
  briefContent: {
    projectType?: string;
    clientName?: string;
    submittedAt?: string;
    responses?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export function BriefPDF({ briefContent }: BriefPDFProps) {
  const { projectType, clientName, submittedAt, responses } = briefContent;

  const projectTypeLabel =
    projectType === "branding"
      ? "Branding"
      : projectType === "web_design"
        ? "Web Design"
        : projectType === "social_media"
          ? "Social Media"
          : projectType ?? "Project";

  // Sort responses by STEP_ORDER
  const sortedEntries = responses
    ? Object.entries(responses).sort(([a], [b]) => {
        const ai = STEP_ORDER.indexOf(a);
        const bi = STEP_ORDER.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.logo}>Briefed.</Text>
            {submittedAt && (
              <Text style={styles.dateBadge}>
                {new Date(submittedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            )}
          </View>
          <Text style={styles.title}>Creative Brief</Text>
          <Text style={styles.subtitle}>
            {clientName ? `Client: ${clientName}` : ""} • {projectTypeLabel}
          </Text>
        </View>

        {/* Sections */}
        {sortedEntries.map(([stepKey, stepData]) => {
          if (!stepData || typeof stepData !== "object") return null;
          const label = STEP_LABELS[stepKey] ?? formatFieldLabel(stepKey);
          const data = stepData as Record<string, unknown>;

          return (
            <View key={stepKey} style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>{label}</Text>

              {/* Special rendering for color preferences */}
              {stepKey === "color_preferences" && Array.isArray(data.selectedColors) && (
                <View style={styles.colorRow}>
                  {(data.selectedColors as string[]).filter(isHexColor).map((hex: string) => (
                    <View key={hex} style={{ alignItems: "center" }}>
                      <View style={[styles.colorSwatch, { backgroundColor: hex }]} />
                      <Text style={styles.colorLabel}>{hex}</Text>
                    </View>
                  ))}
                </View>
              )}

              {Object.entries(data).map(([fieldKey, fieldValue]) => {
                if (fieldKey === "images") return null;
                // Skip colors if we already rendered swatches
                if (stepKey === "color_preferences" && fieldKey === "selectedColors") return null;

                return (
                  <View key={fieldKey} style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>
                      {formatFieldLabel(fieldKey)}
                    </Text>
                    {Array.isArray(fieldValue) && fieldValue.length > 0 ? (
                      <View style={styles.badgeRow}>
                        {fieldValue.map((item, i) => (
                          <Text key={i} style={styles.badge}>
                            {typeof item === "string"
                              ? item
                              : JSON.stringify(item)}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.fieldValue}>
                        {renderValue(fieldValue)}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Briefed • {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.footerBrand}>briefed.co</Text>
        </View>
      </Page>
    </Document>
  );
}
