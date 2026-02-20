/**
 * Template builder utilities for validation, export/import, and manipulation
 */

import type { TemplateStep, TemplateQuestion, TemplateData } from "./defaults";
import type { ProjectType } from "@/types";

// ===========================
// Validation
// ===========================

export interface ValidationError {
  field: string;
  message: string;
  stepIndex?: number;
  questionIndex?: number;
}

export function validateTemplate(
  name: string,
  projectType: ProjectType,
  steps: TemplateStep[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Template name validation
  if (!name.trim()) {
    errors.push({ field: "name", message: "Template name is required" });
  } else if (name.trim().length < 3) {
    errors.push({ field: "name", message: "Template name must be at least 3 characters" });
  }

  // Must have at least one enabled step
  const enabledSteps = steps.filter(s => s.enabled);
  if (enabledSteps.length === 0) {
    errors.push({ field: "steps", message: "At least one step must be enabled" });
  }

  // Step validation
  steps.forEach((step, stepIndex) => {
    if (!step.title.trim()) {
      errors.push({
        field: "stepTitle",
        message: "Step title is required",
        stepIndex,
      });
    }

    if (!step.description.trim()) {
      errors.push({
        field: "stepDescription", 
        message: "Step description is required",
        stepIndex,
      });
    }

    // Question validation
    step.questions.forEach((question, questionIndex) => {
      if (!question.label.trim()) {
        errors.push({
          field: "questionLabel",
          message: "Question label is required",
          stepIndex,
          questionIndex,
        });
      }

      // Options validation for choice-type questions
      if (["multiple_choice", "checkbox", "select"].includes(question.type)) {
        if (!question.options || question.options.length === 0) {
          errors.push({
            field: "questionOptions",
            message: "Options are required for this question type",
            stepIndex,
            questionIndex,
          });
        } else if (question.options.some(opt => !opt.trim())) {
          errors.push({
            field: "questionOptions",
            message: "All options must have text",
            stepIndex,
            questionIndex,
          });
        }
      }
    });
  });

  return errors;
}

export function validateImportedTemplate(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    errors.push({ field: "root", message: "Invalid template data format" });
    return errors;
  }

  if (!data.name || typeof data.name !== "string") {
    errors.push({ field: "name", message: "Template name is required and must be a string" });
  }

  if (!data.projectType || !["branding", "web_design", "social_media"].includes(data.projectType)) {
    errors.push({ field: "projectType", message: "Valid project type is required" });
  }

  if (!Array.isArray(data.steps)) {
    errors.push({ field: "steps", message: "Steps must be an array" });
    return errors;
  }

  // Validate each step structure
  data.steps.forEach((step: any, stepIndex: number) => {
    if (!step.key || typeof step.key !== "string") {
      errors.push({
        field: "stepKey",
        message: "Step key is required",
        stepIndex,
      });
    }

    if (!step.title || typeof step.title !== "string") {
      errors.push({
        field: "stepTitle",
        message: "Step title is required",
        stepIndex,
      });
    }

    if (!step.description || typeof step.description !== "string") {
      errors.push({
        field: "stepDescription",
        message: "Step description is required",
        stepIndex,
      });
    }

    if (typeof step.enabled !== "boolean") {
      errors.push({
        field: "stepEnabled",
        message: "Step enabled flag must be boolean",
        stepIndex,
      });
    }

    if (typeof step.builtIn !== "boolean") {
      errors.push({
        field: "stepBuiltIn",
        message: "Step builtIn flag must be boolean",
        stepIndex,
      });
    }

    if (!Array.isArray(step.questions)) {
      errors.push({
        field: "stepQuestions",
        message: "Step questions must be an array",
        stepIndex,
      });
    } else {
      step.questions.forEach((question: any, questionIndex: number) => {
        const validTypes = ["text", "textarea", "multiple_choice", "image_upload", "checkbox", "select"];
        
        if (!question.id || typeof question.id !== "string") {
          errors.push({
            field: "questionId",
            message: "Question ID is required",
            stepIndex,
            questionIndex,
          });
        }

        if (!question.label || typeof question.label !== "string") {
          errors.push({
            field: "questionLabel",
            message: "Question label is required",
            stepIndex,
            questionIndex,
          });
        }

        if (!validTypes.includes(question.type)) {
          errors.push({
            field: "questionType",
            message: `Question type must be one of: ${validTypes.join(", ")}`,
            stepIndex,
            questionIndex,
          });
        }

        if (question.options && !Array.isArray(question.options)) {
          errors.push({
            field: "questionOptions",
            message: "Question options must be an array",
            stepIndex,
            questionIndex,
          });
        }
      });
    }
  });

  return errors;
}

// ===========================
// Template Manipulation
// ===========================

export function duplicateTemplate(
  originalTemplate: TemplateData,
  newName: string
): TemplateData {
  return {
    ...originalTemplate,
    name: newName,
    steps: originalTemplate.steps.map(step => ({
      ...step,
      key: step.builtIn ? step.key : `${step.key}_copy_${Date.now()}`,
      questions: step.questions.map(question => ({
        ...question,
        id: question.id.startsWith("custom_") ? `custom_${Date.now()}_${Math.random()}` : question.id,
      })),
    })),
  };
}

export function mergeTemplateSteps(
  baseSteps: TemplateStep[],
  additionalSteps: TemplateStep[]
): TemplateStep[] {
  const mergedSteps = [...baseSteps];
  
  additionalSteps.forEach(additionalStep => {
    const existingIndex = mergedSteps.findIndex(s => s.key === additionalStep.key);
    
    if (existingIndex >= 0) {
      // Merge questions if step already exists
      const existingStep = mergedSteps[existingIndex];
      const newQuestions = additionalStep.questions.filter(
        q => !existingStep.questions.some(eq => eq.id === q.id)
      );
      
      mergedSteps[existingIndex] = {
        ...existingStep,
        questions: [...existingStep.questions, ...newQuestions],
      };
    } else {
      // Add new step
      mergedSteps.push(additionalStep);
    }
  });
  
  return mergedSteps;
}

export function removeEmptySteps(steps: TemplateStep[]): TemplateStep[] {
  return steps.filter(step => {
    if (!step.enabled) return true; // Keep disabled steps
    return step.questions.length > 0 || step.builtIn; // Keep steps with questions or built-in steps
  });
}

export function reorderSteps(
  steps: TemplateStep[],
  fromIndex: number,
  toIndex: number
): TemplateStep[] {
  const result = [...steps];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

// ===========================
// Export/Import
// ===========================

export interface TemplateExportData {
  version: string;
  exportedAt: string;
  template: TemplateData;
  metadata: {
    originalId?: string;
    exportedBy?: string;
    tags?: string[];
    description?: string;
  };
}

export function exportTemplate(
  template: TemplateData,
  metadata: TemplateExportData["metadata"] = {}
): TemplateExportData {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    template,
    metadata,
  };
}

export function exportTemplateAsJSON(
  template: TemplateData,
  metadata: TemplateExportData["metadata"] = {}
): string {
  const exportData = exportTemplate(template, metadata);
  return JSON.stringify(exportData, null, 2);
}

export function importTemplate(data: string | TemplateExportData): {
  template: TemplateData;
  metadata: TemplateExportData["metadata"];
  errors: ValidationError[];
} {
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    
    // Handle direct template data (backward compatibility)
    if (parsed.name && parsed.projectType && parsed.steps) {
      const template: TemplateData = {
        name: parsed.name,
        projectType: parsed.projectType,
        steps: parsed.steps,
      };
      
      const errors = validateImportedTemplate(template);
      return { template, metadata: {}, errors };
    }
    
    // Handle export format
    if (!parsed.template) {
      return {
        template: {} as TemplateData,
        metadata: {},
        errors: [{ field: "root", message: "Invalid export format" }],
      };
    }
    
    const errors = validateImportedTemplate(parsed.template);
    return {
      template: parsed.template,
      metadata: parsed.metadata || {},
      errors,
    };
  } catch (error) {
    return {
      template: {} as TemplateData,
      metadata: {},
      errors: [{ field: "root", message: "Failed to parse template data" }],
    };
  }
}

// ===========================
// Template Statistics
// ===========================

export function getTemplateStats(steps: TemplateStep[]) {
  const enabledSteps = steps.filter(s => s.enabled);
  const totalQuestions = enabledSteps.reduce((sum, step) => sum + step.questions.length, 0);
  const requiredQuestions = enabledSteps.reduce(
    (sum, step) => sum + step.questions.filter(q => q.required).length,
    0
  );
  
  const questionTypes = enabledSteps.reduce((types, step) => {
    step.questions.forEach(question => {
      types[question.type] = (types[question.type] || 0) + 1;
    });
    return types;
  }, {} as Record<string, number>);
  
  const estimatedTime = Math.max(5, Math.ceil(totalQuestions * 1.5)); // 1.5 minutes per question, minimum 5 minutes
  
  return {
    enabledStepsCount: enabledSteps.length,
    totalStepsCount: steps.length,
    totalQuestions,
    requiredQuestions,
    questionTypes,
    estimatedCompletionTime: estimatedTime,
    builtInSteps: steps.filter(s => s.builtIn).length,
    customSteps: steps.filter(s => !s.builtIn).length,
  };
}

// ===========================
// Template Comparison
// ===========================

export function compareTemplates(
  template1: TemplateData,
  template2: TemplateData
): {
  nameChanged: boolean;
  projectTypeChanged: boolean;
  stepsAdded: string[];
  stepsRemoved: string[];
  stepsModified: string[];
  questionsAdded: number;
  questionsRemoved: number;
} {
  const comparison = {
    nameChanged: template1.name !== template2.name,
    projectTypeChanged: template1.projectType !== template2.projectType,
    stepsAdded: [] as string[],
    stepsRemoved: [] as string[],
    stepsModified: [] as string[],
    questionsAdded: 0,
    questionsRemoved: 0,
  };
  
  const steps1Keys = new Set(template1.steps.map(s => s.key));
  const steps2Keys = new Set(template2.steps.map(s => s.key));
  
  // Find added and removed steps
  template2.steps.forEach(step => {
    if (!steps1Keys.has(step.key)) {
      comparison.stepsAdded.push(step.title);
    }
  });
  
  template1.steps.forEach(step => {
    if (!steps2Keys.has(step.key)) {
      comparison.stepsRemoved.push(step.title);
    }
  });
  
  // Find modified steps and question changes
  template1.steps.forEach(step1 => {
    const step2 = template2.steps.find(s => s.key === step1.key);
    if (!step2) return;
    
    const step1Questions = step1.questions.length;
    const step2Questions = step2.questions.length;
    
    if (
      step1.title !== step2.title ||
      step1.description !== step2.description ||
      step1.enabled !== step2.enabled ||
      step1Questions !== step2Questions
    ) {
      comparison.stepsModified.push(step1.title);
    }
    
    comparison.questionsAdded += Math.max(0, step2Questions - step1Questions);
    comparison.questionsRemoved += Math.max(0, step1Questions - step2Questions);
  });
  
  return comparison;
}