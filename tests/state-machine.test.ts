/**
 * State Machine Comprehensive Tests
 * 
 * Tests the finite state machine implementation for all possible
 * states, transitions, and edge cases.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { AppStateMachine, AppState, AppEvent, AppContext } from '../src/store/app-state-machine';

describe('App State Machine', () => {
  let machine: AppStateMachine;
  let mockContext: AppContext;

  beforeEach(() => {
    mockContext = {
      sessionId: null,
      dilemmas: [],
      currentIndex: 0,
      responses: [],
      valuesMarkdown: null,
      error: null,
      hasValidSession: false,
      hasCompleteResponses: false,
      canGenerateValues: false
    };
    
    machine = new AppStateMachine(mockContext);
  });

  describe('Initial State', () => {
    test('starts in idle state', () => {
      expect(machine.getCurrentState()).toBe('idle');
    });

    test('initializes context correctly', () => {
      const context = machine.getContext();
      expect(context.sessionId).toBe(null);
      expect(context.dilemmas).toEqual([]);
      expect(context.responses).toEqual([]);
      expect(context.hasValidSession).toBe(false);
    });
  });

  describe('State Transitions', () => {
    test('idle -> loading: START_SESSION', () => {
      machine.send({ type: 'START_SESSION' });
      expect(machine.getCurrentState()).toBe('loading');
    });

    test('idle -> answering: SESSION_RESTORED', () => {
      machine.send({
        type: 'SESSION_RESTORED',
        responses: [{ dilemmaId: 'test', chosenOption: 'a', reasoning: '', responseTime: 1000, perceivedDifficulty: 5 }],
        sessionId: 'test-session'
      });
      expect(machine.getCurrentState()).toBe('answering');
    });

    test('loading -> answering: DILEMMAS_LOADED', () => {
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [
          { dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
        ]
      });
      expect(machine.getCurrentState()).toBe('answering');
    });

    test('loading -> error: DILEMMAS_LOAD_FAILED', () => {
      machine.send({ type: 'START_SESSION' });
      machine.send({ type: 'DILEMMAS_LOAD_FAILED', error: 'Failed to load' });
      expect(machine.getCurrentState()).toBe('error');
      expect(machine.getContext().error).toBe('Failed to load');
    });

    test('answering -> submitting: SUBMIT_RESPONSES', () => {
      // Setup answering state
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      
      machine.send({ type: 'SUBMIT_RESPONSES' });
      expect(machine.getCurrentState()).toBe('submitting');
    });

    test('submitting -> generating: RESPONSES_SUBMITTED', () => {
      // Setup submitting state
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      machine.send({ type: 'SUBMIT_RESPONSES' });
      
      machine.send({ type: 'RESPONSES_SUBMITTED' });
      expect(machine.getCurrentState()).toBe('generating');
    });

    test('generating -> completed: VALUES_GENERATED', () => {
      // Setup generating state
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      machine.send({ type: 'SUBMIT_RESPONSES' });
      machine.send({ type: 'RESPONSES_SUBMITTED' });
      
      machine.send({ type: 'VALUES_GENERATED', valuesMarkdown: '# My Values' });
      expect(machine.getCurrentState()).toBe('completed');
      expect(machine.getContext().valuesMarkdown).toBe('# My Values');
    });

    test('any state -> error: various failure events', () => {
      // From submitting
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      machine.send({ type: 'SUBMIT_RESPONSES' });
      machine.send({ type: 'SUBMISSION_FAILED', error: 'Network error' });
      
      expect(machine.getCurrentState()).toBe('error');
      expect(machine.getContext().error).toBe('Network error');
    });

    test('error -> loading: RETRY', () => {
      // Setup error state
      machine.send({ type: 'START_SESSION' });
      machine.send({ type: 'DILEMMAS_LOAD_FAILED', error: 'Test error' });
      
      machine.send({ type: 'RETRY' });
      expect(machine.getCurrentState()).toBe('loading');
    });

    test('any state -> idle: RESET_SESSION', () => {
      // Go to completed state
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      machine.send({ type: 'SUBMIT_RESPONSES' });
      machine.send({ type: 'RESPONSES_SUBMITTED' });
      machine.send({ type: 'VALUES_GENERATED', valuesMarkdown: '# Values' });
      
      machine.send({ type: 'RESET_SESSION' });
      expect(machine.getCurrentState()).toBe('idle');
    });
  });

  describe('Invalid Transitions', () => {
    test('ignores invalid transitions', () => {
      // Try to submit responses from idle state
      machine.send({ type: 'SUBMIT_RESPONSES' });
      expect(machine.getCurrentState()).toBe('idle');
    });

    test('ignores transitions not defined for current state', () => {
      machine.send({ type: 'START_SESSION' });
      expect(machine.getCurrentState()).toBe('loading');
      
      // Try to navigate to dilemma from loading state
      machine.send({ type: 'NAVIGATE_TO_DILEMMA', index: 1 });
      expect(machine.getCurrentState()).toBe('loading'); // Should stay in loading
    });
  });

  describe('Context Updates', () => {
    test('DILEMMAS_LOADED updates context correctly', () => {
      const dilemmas = [
        { dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' },
        { dilemmaId: 'test-2', title: 'Test 2', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
      ];
      
      machine.send({ type: 'START_SESSION' });
      machine.send({ type: 'DILEMMAS_LOADED', dilemmas, startingIndex: 1 });
      
      const context = machine.getContext();
      expect(context.dilemmas).toEqual(dilemmas);
      expect(context.currentIndex).toBe(1);
      expect(context.hasValidSession).toBe(true);
    });

    test('SESSION_RESTORED updates context correctly', () => {
      const responses = [
        { dilemmaId: 'test-1', chosenOption: 'a', reasoning: 'Test', responseTime: 1000, perceivedDifficulty: 5 }
      ];
      
      machine.send({
        type: 'SESSION_RESTORED',
        responses,
        sessionId: 'test-session-123'
      });
      
      const context = machine.getContext();
      expect(context.responses).toEqual(responses);
      expect(context.sessionId).toBe('test-session-123');
      expect(context.hasValidSession).toBe(true);
      expect(context.hasCompleteResponses).toBe(false); // Only 1 response, need 12
    });

    test('ANSWER_SUBMITTED updates responses correctly', () => {
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      
      const answer = { dilemmaId: 'test-1', chosenOption: 'b', reasoning: 'Because B', responseTime: 2000, perceivedDifficulty: 7 };
      machine.send({ type: 'ANSWER_SUBMITTED', answer });
      
      const context = machine.getContext();
      expect(context.responses).toContainEqual(answer);
    });

    test('ANSWER_SUBMITTED updates existing response', () => {
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      
      // Submit first answer
      const answer1 = { dilemmaId: 'test-1', chosenOption: 'a', reasoning: 'First', responseTime: 1000, perceivedDifficulty: 5 };
      machine.send({ type: 'ANSWER_SUBMITTED', answer: answer1 });
      
      // Update same dilemma
      const answer2 = { dilemmaId: 'test-1', chosenOption: 'b', reasoning: 'Changed', responseTime: 2000, perceivedDifficulty: 8 };
      machine.send({ type: 'ANSWER_SUBMITTED', answer: answer2 });
      
      const context = machine.getContext();
      expect(context.responses).toHaveLength(1);
      expect(context.responses[0]).toEqual(answer2);
    });

    test('VALUES_GENERATED updates valuesMarkdown', () => {
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      machine.send({ type: 'SUBMIT_RESPONSES' });
      machine.send({ type: 'RESPONSES_SUBMITTED' });
      
      const valuesMarkdown = '# My Personal Values\n\nI value honesty and integrity.';
      machine.send({ type: 'VALUES_GENERATED', valuesMarkdown });
      
      const context = machine.getContext();
      expect(context.valuesMarkdown).toBe(valuesMarkdown);
      expect(context.canGenerateValues).toBe(true);
    });
  });

  describe('Validation Flags', () => {
    test('hasCompleteResponses updates when reaching 12 responses', () => {
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: Array.from({ length: 12 }, (_, i) => ({
          dilemmaId: `test-${i}`,
          title: `Test ${i}`,
          scenario: 'Test',
          choiceA: 'A',
          choiceB: 'B',
          choiceC: 'C',
          choiceD: 'D',
          domain: 'test'
        }))
      });
      
      // Add 11 responses
      for (let i = 0; i < 11; i++) {
        machine.send({
          type: 'ANSWER_SUBMITTED',
          answer: { dilemmaId: `test-${i}`, chosenOption: 'a', reasoning: '', responseTime: 1000, perceivedDifficulty: 5 }
        });
      }
      
      expect(machine.getContext().hasCompleteResponses).toBe(false);
      
      // Add 12th response
      machine.send({
        type: 'ANSWER_SUBMITTED',
        answer: { dilemmaId: 'test-11', chosenOption: 'a', reasoning: '', responseTime: 1000, perceivedDifficulty: 5 }
      });
      
      expect(machine.getContext().hasCompleteResponses).toBe(true);
    });
  });

  describe('Event Listeners', () => {
    test('notifies listeners on state changes', () => {
      const stateChanges: Array<{ state: AppState; context: AppContext }> = [];
      
      machine.subscribe((state, context) => {
        stateChanges.push({ state, context });
      });
      
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      
      expect(stateChanges).toHaveLength(2);
      expect(stateChanges[0].state).toBe('loading');
      expect(stateChanges[1].state).toBe('answering');
    });

    test('unsubscribe works correctly', () => {
      const stateChanges: AppState[] = [];
      
      const unsubscribe = machine.subscribe((state) => {
        stateChanges.push(state);
      });
      
      machine.send({ type: 'START_SESSION' });
      unsubscribe();
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      
      expect(stateChanges).toHaveLength(1); // Only the first transition
    });
  });

  describe('Transition Validation', () => {
    test('canTransition returns correct values', () => {
      // In idle state
      expect(machine.canTransition('START_SESSION')).toBe(true);
      expect(machine.canTransition('SUBMIT_RESPONSES')).toBe(false);
      
      // Move to loading state
      machine.send({ type: 'START_SESSION' });
      expect(machine.canTransition('DILEMMAS_LOADED')).toBe(true);
      expect(machine.canTransition('START_SESSION')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('handles listener errors gracefully', () => {
      machine.subscribe(() => {
        throw new Error('Test error in listener');
      });
      
      // Should not throw, just log error
      expect(() => {
        machine.send({ type: 'START_SESSION' });
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty dilemmas array', () => {
      machine.send({ type: 'START_SESSION' });
      machine.send({ type: 'DILEMMAS_LOADED', dilemmas: [] });
      
      const context = machine.getContext();
      expect(context.dilemmas).toEqual([]);
      expect(context.currentIndex).toBe(0);
    });

    test('handles navigate to invalid index', () => {
      machine.send({ type: 'START_SESSION' });
      machine.send({
        type: 'DILEMMAS_LOADED',
        dilemmas: [{ dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }]
      });
      
      machine.send({ type: 'NAVIGATE_TO_DILEMMA', index: 999 });
      
      // Should still be valid
      expect(machine.getCurrentState()).toBe('answering');
      expect(machine.getContext().currentIndex).toBe(999); // Machine allows this, validation should happen at UI level
    });
  });
});