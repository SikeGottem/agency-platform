"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemplateStep } from "@/lib/templates/defaults";

interface TemplatePreviewProps {
  steps: TemplateStep[];
}

export function TemplatePreview({ steps }: TemplatePreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (steps.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-muted-foreground">
            No enabled steps to preview. Enable some steps in the builder to see the client experience.
          </p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress Header */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">
            STEP {currentStep + 1} OF {steps.length}
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              backgroundColor: "#E05252"
            }}
          />
        </div>

        <h2 className="font-display text-2xl font-bold mb-2">
          {currentStepData.title}
        </h2>
        <p className="text-muted-foreground">
          {currentStepData.description}
        </p>
      </div>

      {/* Questions */}
      <div className="rounded-lg border bg-white p-6">
        {currentStepData.questions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No questions in this step. This might be an informational step.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentStepData.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <label className="block text-sm font-medium">
                  {question.label}
                  {question.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>

                {question.type === "text" && (
                  <Input
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                  />
                )}

                {question.type === "textarea" && (
                  <Textarea
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                  />
                )}

                {question.type === "select" && question.options && (
                  <Select
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {question.type === "multiple_choice" && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={responses[question.id] === option}
                          onChange={(e) => handleResponseChange(question.id, e.target.value)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "checkbox" && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(responses[question.id] || []).includes(option)}
                          onChange={(e) => {
                            const currentValues = responses[question.id] || [];
                            if (e.target.checked) {
                              handleResponseChange(question.id, [...currentValues, option]);
                            } else {
                              handleResponseChange(question.id, currentValues.filter((v: string) => v !== option));
                            }
                          }}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "image_upload" && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 mb-4 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                )}

                {question.description && (
                  <p className="text-xs text-muted-foreground">
                    {question.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          ← Previous
        </Button>

        <div className="flex items-center space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? "bg-red-500"
                  : index < currentStep
                  ? "bg-red-300"
                  : "bg-gray-300"
              }`}
              title={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          style={{ backgroundColor: "#E05252" }}
          className="text-white hover:opacity-90"
        >
          {currentStep === steps.length - 1 ? "Complete" : "Next →"}
        </Button>
      </div>
    </div>
  );
}