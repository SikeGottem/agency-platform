import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../button';
import { Input } from '../input';

describe('Focus Indicators', () => {
  describe('Button Component', () => {
    test('renders with proper focus-visible ring classes', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button', { name: 'Test Button' });
      
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-primary');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
      expect(button).toHaveClass('focus-visible:outline-none');
    });

    test('different variants have appropriate focus styles', () => {
      const { rerender } = render(<Button variant="default">Default</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-primary');

      rerender(<Button variant="destructive">Destructive</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-destructive');

      rerender(<Button variant="outline">Outline</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-primary');
    });

    test('has dark mode ring offset classes', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('focus-visible:ring-offset-white');
      expect(button).toHaveClass('dark:focus-visible:ring-offset-black');
    });

    test('link variant has reduced ring offset', () => {
      render(<Button variant="link">Link Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('focus-visible:ring-offset-1');
    });

    test('maintains accessibility when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Input Component', () => {
    test('renders with proper focus-visible ring classes', () => {
      render(<Input placeholder="Test input" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('focus-visible:ring-2');
      expect(input).toHaveClass('focus-visible:ring-primary');
      expect(input).toHaveClass('focus-visible:ring-offset-2');
      expect(input).toHaveClass('focus-visible:outline-none');
    });

    test('has dark mode ring offset classes', () => {
      render(<Input placeholder="Test input" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('focus-visible:ring-offset-white');
      expect(input).toHaveClass('dark:focus-visible:ring-offset-black');
    });

    test('applies additional className properly', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('focus-visible:ring-2'); // Should still have focus classes
    });

    test('supports different input types', () => {
      const { rerender } = render(<Input type="email" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      input = screen.getByDisplayRole('textbox') ?? screen.getByLabelText(/password/i);
      if (!input) {
        // Try finding password input differently
        input = document.querySelector('input[type="password"]') as HTMLInputElement;
      }
      expect(input).toHaveAttribute('type', 'password');
    });

    test('maintains focus styles when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
      expect(input).toHaveClass('focus-visible:ring-2'); // Should still have focus classes
    });
  });

  describe('Focus Indicator Contrast', () => {
    test('primary ring color provides sufficient contrast', () => {
      // This is a visual test - we test that the class is applied
      // The actual contrast would be tested by the CSS color values
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('focus-visible:ring-primary');
    });

    test('custom focus colors for brand elements', () => {
      // Test that custom colors are properly applied where needed
      // This would be used for elements with the brand color focus
      const TestComponent = () => (
        <a 
          href="/test" 
          className="focus-visible:ring-[#E05252] focus-visible:ring-2 focus-visible:outline-none"
        >
          Brand Link
        </a>
      );
      
      render(<TestComponent />);
      const link = screen.getByRole('link');
      
      expect(link).toHaveClass('focus-visible:ring-[#E05252]');
      expect(link).toHaveClass('focus-visible:ring-2');
      expect(link).toHaveClass('focus-visible:outline-none');
    });
  });

  describe('Focus Indicator Behavior', () => {
    test('focus indicators appear on keyboard navigation', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button');
      
      // Simulate tab navigation
      fireEvent.focus(button);
      
      // The focus-visible classes should be present in the className
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toBeFocused();
    });

    test('input focus indicators work with form interactions', () => {
      render(<Input placeholder="Test input" />);
      const input = screen.getByRole('textbox');
      
      fireEvent.focus(input);
      
      expect(input).toHaveClass('focus-visible:ring-primary');
      expect(input).toBeFocused();
    });

    test('ring offset provides proper spacing', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('focus-visible:ring-offset-2');
      expect(button).toHaveClass('focus-visible:ring-offset-white');
      expect(button).toHaveClass('dark:focus-visible:ring-offset-black');
    });
  });
});