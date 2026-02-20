import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register fonts (using default fonts for now)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2pt solid #667eea",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1pt solid #e5e7eb",
  },
  field: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 11,
    color: "#1f2937",
  },
  badge: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 9,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeDestructive: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#9ca3af",
    borderTop: "1pt solid #e5e7eb",
    paddingTop: 10,
  },
});

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
      timeline_budget?: {
        timeline?: string;
        budgetRange?: string;
        priorities?: string[];
      };
      final_thoughts?: {
        additionalNotes?: string;
      };
    };
  };
}

export function BriefPDF({ content }: BriefPDFProps) {
  const r = content.responses || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Creative Brief</Text>
          <Text style={styles.subtitle}>
            {content.clientName || content.clientEmail} • {content.projectType?.replace("_", " ")} •
            {content.submittedAt ? new Date(content.submittedAt).toLocaleDateString() : ""}
          </Text>
        </View>

        {/* Business Info */}
        {r.business_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Business</Text>
            {r.business_info.companyName && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Company Name</Text>
                <Text style={styles.fieldValue}>{r.business_info.companyName}</Text>
              </View>
            )}
            {r.business_info.industry && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Industry</Text>
                <Text style={styles.fieldValue}>{r.business_info.industry}</Text>
              </View>
            )}
            {r.business_info.description && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Description</Text>
                <Text style={styles.fieldValue}>{r.business_info.description}</Text>
              </View>
            )}
            {r.business_info.targetAudience && r.business_info.targetAudience.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Target Audience</Text>
                <Text style={styles.fieldValue}>{r.business_info.targetAudience.join(", ")}</Text>
              </View>
            )}
            {r.business_info.competitors && r.business_info.competitors.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Competitors / Brand Inspiration</Text>
                <Text style={styles.fieldValue}>{r.business_info.competitors.join(", ")}</Text>
              </View>
            )}
          </View>
        )}

        {/* Style Direction */}
        {r.style_direction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Style Direction</Text>
            {r.style_direction.selectedStyles && r.style_direction.selectedStyles.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>✨ Styles that feel RIGHT</Text>
                <Text style={styles.fieldValue}>{r.style_direction.selectedStyles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}</Text>
              </View>
            )}
            {r.style_direction.antiInspiration && r.style_direction.antiInspiration.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>⛔ Styles to AVOID</Text>
                <Text style={styles.fieldValue}>{r.style_direction.antiInspiration.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}</Text>
              </View>
            )}
          </View>
        )}

        {/* Color Preferences */}
        {r.color_preferences && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Preferences</Text>
            {r.color_preferences.avoidColors && r.color_preferences.avoidColors.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Colors to Avoid</Text>
                <Text style={styles.fieldValue}>{r.color_preferences.avoidColors.join(", ")}</Text>
              </View>
            )}
          </View>
        )}

        {/* Timeline & Budget */}
        {r.timeline_budget && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline & Budget</Text>
            {r.timeline_budget.timeline && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Timeline</Text>
                <Text style={styles.fieldValue}>{r.timeline_budget.timeline}</Text>
              </View>
            )}
            {r.timeline_budget.budgetRange && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Budget Range</Text>
                <Text style={styles.fieldValue}>{r.timeline_budget.budgetRange}</Text>
              </View>
            )}
            {r.timeline_budget.priorities && r.timeline_budget.priorities.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Priorities</Text>
                <Text style={styles.fieldValue}>{r.timeline_budget.priorities.join(", ")}</Text>
              </View>
            )}
          </View>
        )}

        {/* Final Thoughts */}
        {r.final_thoughts?.additionalNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={styles.fieldValue}>{r.final_thoughts.additionalNotes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Briefed • Better creative briefs in minutes
        </Text>
      </Page>
    </Document>
  );
}
