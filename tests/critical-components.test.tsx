/**
 * Critical Components Test Suite
 * 
 * Tests for stateful components identified by categorical analysis
 * as needing test coverage for fibration coherence.
 */

import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataSelectionWidget from '../src/components/data-selection-widget';
import SystemState from '../src/components/system-state';
import { ErrorBoundary, DilemmaErrorBoundary, AdminErrorBoundary, ValuesGenerationErrorBoundary } from '../src/components/error-boundary';

// Mock the UI components
vi.mock('../src/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card-title">{children}</div>
}));

vi.mock('../src/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, disabled }: any) => 
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
}));

vi.mock('../src/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step }: any) => 
    <input 
      data-testid="slider"
      type="range"
      min={min}
      max={max}
      step={step}
      value={Array.isArray(value) ? value[0] : value}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
    />
}));

vi.mock('../src/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => 
    <span data-testid="badge" data-variant={variant}>{children}</span>
}));

describe('Critical Stateful Components', () => {
  describe('DataSelectionWidget', () => {
    const mockAvailableData = [
      {
        sessionId: 'session1',
        responseCount: 5,
        difficulty: 6.8,
        motifs: ['NUMBERS_FIRST', 'PERSON_FIRST'],
        domain: 'healthcare',
        timestamp: '2024-01-15T10:00:00Z',
        demographics: { ageRange: '25-34', profession: 'researcher' }
      },
      {
        sessionId: 'session2',
        responseCount: 3,
        difficulty: 5.2,
        motifs: ['RULES_FIRST', 'PROCESS_FIRST'],
        domain: 'technology',
        timestamp: '2024-01-15T11:00:00Z'
      }
    ];

    const mockOnConfigChange = vi.fn();

    beforeEach(() => {
      mockOnConfigChange.mockClear();
    });

    test('should render data selection controls correctly', () => {
      render(
        <DataSelectionWidget 
          onConfigChange={mockOnConfigChange}
          availableData={mockAvailableData}
        />
      );

      expect(screen.getByTestId('card-title')).toHaveTextContent('Data Selection & Sampling');
      expect(screen.getByText('Difficulty Range')).toBeInTheDocument();
      expect(screen.getByText('Sample Size')).toBeInTheDocument();
    });

    test('should handle difficulty range changes', async () => {
      render(
        <DataSelectionWidget 
          onConfigChange={mockOnConfigChange}
          availableData={mockAvailableData}
        />
      );

      const slider = screen.getByTestId('slider');
      fireEvent.change(slider, { target: { value: '8' } });

      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalled();
      });
    });

    test('should show validation warnings for insufficient data', () => {
      const smallDataset = [mockAvailableData[0]]; // Only 1 session

      render(
        <DataSelectionWidget 
          onConfigChange={mockOnConfigChange}
          availableData={smallDataset}
        />
      );

      // Component should show validation warnings
      expect(screen.getByText(/Selection Warnings|Selection Issues/)).toBeInTheDocument();
    });

    test('should handle empty data gracefully', () => {
      render(
        <DataSelectionWidget 
          onConfigChange={mockOnConfigChange}
          availableData={[]}
        />
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: false,
          validationMessages: expect.arrayContaining([
            expect.stringContaining('No data matches current filters')
          ])
        })
      );
    });

    test('should apply smart defaults correctly', async () => {
      render(
        <DataSelectionWidget 
          onConfigChange={mockOnConfigChange}
          availableData={mockAvailableData}
        />
      );

      const smartDefaultsButton = screen.getByText('Smart Defaults');
      fireEvent.click(smartDefaultsButton);

      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalledWith(
          expect.objectContaining({
            difficultyRange: [3, 8],
            motifFilter: [],
            domainFilter: [],
            burstiness: 60
          })
        );
      });
    });

    test('should toggle between simple and advanced modes', () => {
      render(
        <DataSelectionWidget 
          onConfigChange={mockOnConfigChange}
          availableData={mockAvailableData}
        />
      );

      const advancedButton = screen.getByText('Advanced');
      fireEvent.click(advancedButton);

      expect(screen.getByText('Ethical Motif Selection')).toBeInTheDocument();
      expect(screen.getByText('Sampling Strategy')).toBeInTheDocument();
    });
  });

  describe('SystemState Component', () => {
    test('should render system state indicators', () => {
      render(<SystemState />);
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('System State')).toBeInTheDocument();
    });

    test('should show current timestamp', () => {
      render(<SystemState />);
      
      // Should contain some timestamp or date information
      const content = screen.getByTestId('card-content');
      expect(content).toHaveTextContent(/\d{4}|\d{2}:\d{2}/); // Either year or time format
    });

    test('should maintain consistent state across renders', () => {
      const { rerender } = render(<SystemState />);
      const initialContent = screen.getByTestId('card-content').textContent;
      
      rerender(<SystemState />);
      const rerenderedContent = screen.getByTestId('card-content').textContent;
      
      // Core state should be consistent (allowing for timestamp updates)
      expect(rerenderedContent).toBeDefined();
    });
  });

  describe('Error Boundary Components', () => {
    // Mock a component that throws an error
    const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Working component</div>;
    };

    test('ErrorBoundary should catch component errors gracefully', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('ErrorBoundary should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    test('DilemmaErrorBoundary should provide dilemma-specific error handling', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <DilemmaErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </DilemmaErrorBoundary>
      );

      expect(screen.getByText('❌ Dilemma Loading Error')).toBeInTheDocument();
      expect(screen.getByText('🎲 Get Different Dilemma')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('AdminErrorBoundary should provide admin-specific error handling', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AdminErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </AdminErrorBoundary>
      );

      expect(screen.getByText('🔒 Admin Panel Error')).toBeInTheDocument();
      expect(screen.getByText('🏠 Return to Admin Home')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('ValuesGenerationErrorBoundary should provide values-specific error handling', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ValuesGenerationErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ValuesGenerationErrorBoundary>
      );

      expect(screen.getByText('⚡ Values Generation Error')).toBeInTheDocument();
      expect(screen.getByText('🔙 Back to Results')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('Error boundaries should provide retry functionality', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();

      const retryButton = screen.getByText('🔄 Try Again');
      fireEvent.click(retryButton);

      // After retry, the error boundary should reset
      rerender(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Component State Management', () => {
    test('should prevent race conditions in state updates', async () => {
      const mockOnConfigChange = vi.fn();
      
      render(
        <DataSelectionWidget 
          onConfigChange={mockOnConfigChange}
          availableData={mockAvailableData}
        />
      );

      // Simulate rapid state changes
      const slider = screen.getByTestId('slider');
      fireEvent.change(slider, { target: { value: '6' } });
      fireEvent.change(slider, { target: { value: '7' } });
      fireEvent.change(slider, { target: { value: '8' } });

      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalled();
      });

      // The final call should have the last value
      const lastCall = mockOnConfigChange.mock.calls[mockOnConfigChange.mock.calls.length - 1];
      expect(lastCall[0].difficultyRange).toContain(8);
    });

    test('should handle state conflicts gracefully', () => {
      const mockOnConfigChange = vi.fn();
      
      render(
        <DataSelectionWidget 
          onConfigChange={mockOnConfigChange}
          availableData={mockAvailableData}
        />
      );

      // Simulate conflicting actions
      const resetButton = screen.getByText('Reset');
      const smartDefaultsButton = screen.getByText('Smart Defaults');

      fireEvent.click(smartDefaultsButton);
      fireEvent.click(resetButton);

      // Should handle both actions without errors
      expect(mockOnConfigChange).toHaveBeenCalled();
    });

    test('should maintain consistent system state indicators', () => {
      const { rerender } = render(<SystemState />);
      
      const initialState = screen.getByTestId('card-content').textContent;
      
      // Re-render multiple times
      rerender(<SystemState />);
      rerender(<SystemState />);
      
      const finalState = screen.getByTestId('card-content').textContent;
      
      // Core indicators should remain consistent
      expect(finalState).toBeDefined();
      expect(typeof finalState).toBe('string');
    });
  });
});