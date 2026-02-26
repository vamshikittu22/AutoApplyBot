import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AISettings } from './AISettings';
import * as aiLib from '@/lib/ai';

vi.mock('@/lib/ai');

describe('AISettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(aiLib.getAIConfig).mockResolvedValue({
      provider: 'mock',
      lastUsedProvider: 'mock',
    });

    vi.mocked(aiLib.hasValidKey).mockResolvedValue(false);
  });

  it('should render provider selection', async () => {
    render(<AISettings />);

    await waitFor(() => {
      expect(screen.getByText(/Mock AI \(Free\)/i)).toBeInTheDocument();
      expect(screen.getByText(/OpenAI GPT-4o/i)).toBeInTheDocument();
      expect(screen.getByText(/Anthropic Claude/i)).toBeInTheDocument();
    });
  });

  it('should show API key input for OpenAI', async () => {
    render(<AISettings />);

    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText('sk-...');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it('should validate OpenAI key format', async () => {
    render(<AISettings />);

    await waitFor(() => screen.getAllByPlaceholderText('sk-...'));

    const inputs = screen.getAllByPlaceholderText('sk-...');
    const openaiInput = inputs[0]; // First one is OpenAI
    const buttons = screen.getAllByText('Validate & Save');
    const openaiButton = buttons[0]; // First button is OpenAI

    fireEvent.change(openaiInput, { target: { value: 'invalid-key' } });
    fireEvent.click(openaiButton);

    await waitFor(() => {
      expect(screen.getByText(/should start with "sk-"/i)).toBeInTheDocument();
    });
  });

  it('should call validation on valid key', async () => {
    const mockProvider = {
      validateKey: vi.fn().mockResolvedValue(true),
    };

    vi.mocked(aiLib.createProviderForValidation).mockResolvedValue(mockProvider as never);
    vi.mocked(aiLib.saveAPIKey).mockResolvedValue(undefined);

    render(<AISettings />);

    await waitFor(() => screen.getAllByPlaceholderText('sk-...'));

    const inputs = screen.getAllByPlaceholderText('sk-...');
    const openaiInput = inputs[0];
    const buttons = screen.getAllByText('Validate & Save');
    const openaiButton = buttons[0];

    fireEvent.change(openaiInput, { target: { value: 'sk-test-key' } });
    fireEvent.click(openaiButton);

    await waitFor(() => {
      expect(aiLib.createProviderForValidation).toHaveBeenCalledWith('openai', 'sk-test-key');
      expect(mockProvider.validateKey).toHaveBeenCalled();
      expect(aiLib.saveAPIKey).toHaveBeenCalled();
    });
  });

  it('should show configured key status', async () => {
    vi.mocked(aiLib.getAIConfig).mockResolvedValue({
      provider: 'openai',
      lastUsedProvider: 'openai',
      openaiKey: 'sk-test',
      openaiValidatedAt: Date.now(),
    });

    vi.mocked(aiLib.hasValidKey).mockImplementation(async (provider: string) => {
      return provider === 'openai';
    });

    render(<AISettings />);

    await waitFor(() => {
      expect(screen.getByText(/OpenAI API key configured and validated/i)).toBeInTheDocument();
    });
  });

  it('should handle provider switching', async () => {
    vi.mocked(aiLib.setAIProvider).mockResolvedValue(undefined);

    render(<AISettings />);

    await waitFor(() => screen.getByText(/Mock AI \(Free\)/i));

    const mockRadio = screen.getByDisplayValue('mock');
    fireEvent.click(mockRadio);

    await waitFor(() => {
      expect(aiLib.setAIProvider).toHaveBeenCalledWith('mock');
    });
  });

  it('should prevent switching to provider without key', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AISettings />);

    await waitFor(() => screen.getByText(/OpenAI GPT-4o/i));

    const openaiRadio = screen.getByDisplayValue('openai');
    fireEvent.click(openaiRadio);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('validate an OpenAI API key'));
    });

    alertSpy.mockRestore();
  });
});
