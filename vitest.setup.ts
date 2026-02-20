import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock window.getComputedStyle for tests that don't need DOM
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: '2px solid blue'
  }),
  writable: true,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    getEntriesByType: () => [],
    mark: () => {},
    measure: () => {},
    now: () => Date.now()
  },
  writable: true,
});

// Mock document methods
Object.defineProperty(document, 'querySelectorAll', {
  value: () => [],
  writable: true,
});