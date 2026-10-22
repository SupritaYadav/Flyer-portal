import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as api from './lib/api';
import { ANALYTICS_MESSAGE } from './lib/analytics';

async function ready() {
  render(<App />);
  await screen.findByRole('table');
}

describe('Happy path', () => {
  it('shows the portal interface with the member list', async () => {
    await ready();
    expect(screen.getByRole('heading', { level: 1, name: /frequent flyer portal/i })).toBeInTheDocument();
    expect(screen.getByText('Aarav Mehta')).toBeInTheDocument();
  });

  it('registers a member, updates the list and fires analytics', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    await ready();
    await user.type(screen.getByLabelText('Full name'), 'Zoya Khan');
    await user.type(screen.getByLabelText('Email'), 'zoya@example.com');
    await user.type(screen.getByLabelText('Miles balance'), '30000');
    await user.click(screen.getByRole('button', { name: /register member/i }));
    expect(await screen.findByText('Zoya Khan')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveValue('');
    expect(log).toHaveBeenCalledWith(ANALYTICS_MESSAGE);
  });

  it('removes a member and fires analytics', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Remove Aarav Mehta' }));
    await vi.waitFor(() => expect(screen.queryByText('Aarav Mehta')).not.toBeInTheDocument());
    expect(log).toHaveBeenCalledWith(ANALYTICS_MESSAGE);
  });
});

describe('Unhappy path', () => {
  it('shows a loading indicator during async loading', async () => {
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading members/i);
    await screen.findByRole('table');
    expect(screen.queryByText(/loading members/i)).not.toBeInTheDocument();
  });

  it('shows "No data found" instead of a blank screen when search is empty', async () => {
    const user = userEvent.setup();
    await ready();
    await user.type(screen.getByLabelText(/search/i), 'zzzz');
    expect(screen.getByRole('status')).toHaveTextContent(/no data found/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('blocks invalid submissions and highlights the offending fields', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const save = vi.spyOn(api, 'saveMembers');
    const user = userEvent.setup();
    await ready();
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /register member/i }));
    for (const label of ['Full name', 'Email', 'Miles balance']) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveClass('invalid');
    }
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(save).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('shows an error banner with retry when loading fails', async () => {
    vi.spyOn(api, 'loadMembers').mockRejectedValueOnce(new Error('offline'));
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});

describe('Non-functional requirements', () => {
  it('sanitises XSS payloads before storing them in state', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    await ready();
    await user.type(screen.getByLabelText('Full name'), '<img src=x onerror=alert(1)>Eve');
    await user.type(screen.getByLabelText('Email'), 'eve@example.com');
    await user.type(screen.getByLabelText('Miles balance'), '10');
    await user.click(screen.getByRole('button', { name: /register member/i }));
    const row = (await screen.findByRole('rowheader', { name: /eve/i })).closest('tr');
    expect(within(row).getByRole('rowheader').textContent).not.toMatch(/[<>]/);
    expect(document.querySelector('img')).toBeNull();
  });

  it('gives every interactive element an accessible name', async () => {
    await ready();
    for (const el of [...screen.getAllByRole('textbox'), ...screen.getAllByRole('button')]) {
      expect(el).toHaveAccessibleName();
    }
    expect(screen.getByRole('searchbox')).toHaveAccessibleName();
  });

  it('is keyboard navigable', async () => {
    const user = userEvent.setup();
    await ready();
    await user.tab();
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });
});
