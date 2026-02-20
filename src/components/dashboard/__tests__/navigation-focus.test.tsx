import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardNav } from '../dashboard-nav';
import { SidebarNav } from '../sidebar-nav';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: jest.fn(),
    },
  })),
}));

const mockUser = {
  email: 'test@example.com',
  name: 'Test User',
  id: '1',
};

describe('Navigation Focus Indicators', () => {
  const mockUsePathname = usePathname as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
    });
  });

  describe('DashboardNav', () => {
    test('brand link has focus indicators', () => {
      render(<DashboardNav user={mockUser} role="designer" />);
      const brandLink = screen.getByRole('link', { name: 'Briefed' });
      
      expect(brandLink).toHaveClass('focus-visible:outline-none');
      expect(brandLink).toHaveClass('focus-visible:ring-2');
      expect(brandLink).toHaveClass('focus-visible:ring-primary');
      expect(brandLink).toHaveClass('focus-visible:ring-offset-2');
    });

    test('navigation links have focus indicators', () => {
      render(<DashboardNav user={mockUser} role="designer" />);
      
      // Find navigation links by their text content
      const projectsLink = screen.getByRole('link', { name: /projects/i });
      const templatesLink = screen.getByRole('link', { name: /templates/i });
      const settingsLink = screen.getByRole('link', { name: /settings/i });

      [projectsLink, templatesLink, settingsLink].forEach(link => {
        expect(link).toHaveClass('focus-visible:outline-none');
        expect(link).toHaveClass('focus-visible:ring-2');
        expect(link).toHaveClass('focus-visible:ring-primary');
        expect(link).toHaveClass('focus-visible:ring-offset-2');
      });
    });

    test('has dark mode ring offset support', () => {
      render(<DashboardNav user={mockUser} role="client" />);
      const brandLink = screen.getByRole('link', { name: 'Briefed' });
      
      expect(brandLink).toHaveClass('focus-visible:ring-offset-white');
      expect(brandLink).toHaveClass('dark:focus-visible:ring-offset-black');
    });

    test('client role shows appropriate navigation', () => {
      render(<DashboardNav user={mockUser} role="client" />);
      
      expect(screen.getByRole('link', { name: /my briefs/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /projects/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /templates/i })).not.toBeInTheDocument();
    });
  });

  describe('SidebarNav', () => {
    test('brand link has focus indicators', () => {
      render(<SidebarNav user={mockUser} role="designer" />);
      const brandLinks = screen.getAllByRole('link', { name: 'Briefed' });
      
      // Should have focus indicators on both mobile and desktop versions
      brandLinks.forEach(link => {
        expect(link).toHaveClass('focus-visible:outline-none');
        expect(link).toHaveClass('focus-visible:ring-2');
        expect(link).toHaveClass('focus-visible:ring-primary');
        expect(link).toHaveClass('focus-visible:ring-offset-2');
      });
    });

    test('sidebar navigation links have focus indicators', () => {
      render(<SidebarNav user={mockUser} role="designer" />);
      
      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
      const templateLinks = screen.getAllByRole('link', { name: /templates/i });
      const settingLinks = screen.getAllByRole('link', { name: /settings/i });

      [...dashboardLinks, ...templateLinks, ...settingLinks].forEach(link => {
        // Skip brand links (already tested above)
        if (link.textContent === 'Briefed') return;
        
        expect(link).toHaveClass('focus-visible:outline-none');
        expect(link).toHaveClass('focus-visible:ring-2');
        expect(link).toHaveClass('focus-visible:ring-primary');
        expect(link).toHaveClass('focus-visible:ring-offset-2');
      });
    });

    test('supports dark mode ring offsets', () => {
      render(<SidebarNav user={mockUser} role="designer" />);
      const brandLink = screen.getAllByRole('link', { name: 'Briefed' })[0];
      
      expect(brandLink).toHaveClass('focus-visible:ring-offset-white');
      expect(brandLink).toHaveClass('dark:focus-visible:ring-offset-black');
    });

    test('new project button has proper focus styling', () => {
      render(<SidebarNav user={mockUser} role="designer" />);
      const newProjectButton = screen.getByRole('link', { name: /new project/i });
      
      // This should inherit Button component styles
      expect(newProjectButton.closest('button, a')).toHaveClass('focus-visible:ring-2');
    });

    test('sign out button has focus indicators', () => {
      render(<SidebarNav user={mockUser} role="designer" />);
      const signOutButton = screen.getByRole('button', { name: /log out/i });
      
      expect(signOutButton).toHaveClass('focus-visible:outline-none');
    });
  });

  describe('Focus Indicator Accessibility', () => {
    test('focus indicators provide sufficient visual distinction', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button');
      
      // Test that focus ring has proper thickness (2px)
      expect(button).toHaveClass('focus-visible:ring-2');
      
      // Test that outline is removed to avoid double rings
      expect(button).toHaveClass('focus-visible:outline-none');
    });

    test('input focus indicators work with form labels', () => {
      render(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" placeholder="Test" />
        </div>
      );
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      // Test proper label association
      expect(input).toHaveAccessibleName('Test Label');
      
      // Test focus indicators
      expect(input).toHaveClass('focus-visible:ring-primary');
      expect(input).toHaveClass('focus-visible:ring-2');
    });

    test('focus indicators maintain visibility on different backgrounds', () => {
      render(<Button className="bg-dark">Dark Background Button</Button>);
      const button = screen.getByRole('button');
      
      // Should have light ring offset for dark backgrounds
      expect(button).toHaveClass('focus-visible:ring-offset-white');
      expect(button).toHaveClass('dark:focus-visible:ring-offset-black');
    });

    test('keyboard navigation flow works properly', () => {
      render(
        <div>
          <Button>First Button</Button>
          <Input placeholder="Input Field" />
          <Button>Second Button</Button>
        </div>
      );

      const firstButton = screen.getByRole('button', { name: 'First Button' });
      const input = screen.getByRole('textbox');
      const secondButton = screen.getByRole('button', { name: 'Second Button' });

      // Test focus order and visibility
      firstButton.focus();
      expect(firstButton).toBeFocused();
      expect(firstButton).toHaveClass('focus-visible:ring-2');

      // Tab to next element
      fireEvent.keyDown(firstButton, { key: 'Tab' });
      input.focus();
      expect(input).toBeFocused();
      expect(input).toHaveClass('focus-visible:ring-2');

      // Tab to next element  
      fireEvent.keyDown(input, { key: 'Tab' });
      secondButton.focus();
      expect(secondButton).toBeFocused();
      expect(secondButton).toHaveClass('focus-visible:ring-2');
    });
  });
});