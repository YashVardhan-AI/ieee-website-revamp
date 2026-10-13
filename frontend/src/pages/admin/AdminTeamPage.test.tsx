/**
 * The roster screen's create path.
 *
 * Adding someone is the one action here that has no row to hang off, so it
 * lives in the page header and is easy to lose in a redesign. These cover
 * that it is reachable, that it opens an empty form rather than the last
 * member's, and that every published category - the executive committee
 * included - can be chosen for a brand new member.
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import AdminTeamPage from './AdminTeamPage';
import type { TeamMemberAdmin } from '@/types/api';

const list = vi.fn();
const create = vi.fn();

vi.mock('@/api/endpoints', () => ({
  adminApi: {
    team: {
      list: (...args: unknown[]) => list(...args),
      create: (...args: unknown[]) => create(...args),
      update: vi.fn(),
      remove: vi.fn(),
      reorder: vi.fn(),
      graduate: vi.fn(),
    },
    uploads: { create: vi.fn() },
  },
}));

function makeMember(overrides: Partial<TeamMemberAdmin> = {}): TeamMemberAdmin {
  return {
    id: 1,
    slug: 'asha-rao',
    name: 'Asha Rao',
    position: 'Chairperson',
    category: 'core',
    photo: null,
    department: null,
    year: null,
    bio: null,
    email: null,
    linkedin_url: null,
    github_url: null,
    website_url: null,
    term: '2025-26',
    sort_order: 0,
    is_active: true,
    ...overrides,
  };
}

beforeEach(() => {
  list.mockResolvedValue([makeMember()]);
  create.mockResolvedValue(makeMember({ id: 2, name: 'Nikhil Menon' }));
});

describe('AdminTeamPage', () => {
  it('offers a way to add someone, not just to edit the people already listed', async () => {
    renderWithProviders(<AdminTeamPage />);

    await screen.findByText('Asha Rao');
    expect(screen.getByRole('button', { name: /add member/i })).toBeInTheDocument();
  });

  it('opens an empty form, so the new member does not inherit the last one typed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminTeamPage />);

    await screen.findByText('Asha Rao');
    await user.click(screen.getByRole('button', { name: /edit asha rao/i }));
    expect(await screen.findByLabelText(/name/i)).toHaveValue('Asha Rao');

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await user.click(screen.getByRole('button', { name: /add member/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText(/name/i)).toHaveValue('');
  });

  it('lists a category nobody is in yet, so the first member can be put there', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminTeamPage />);

    // The fixture roster holds one core member and nobody else.
    await screen.findByText('Asha Rao');
    expect(screen.getByText('Executive Committee')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add to executive committee/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText(/category/i)).toHaveValue('executive');
  });

  it('can create a member in any published category, the executive committee included', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminTeamPage />);

    await screen.findByText('Asha Rao');
    await user.click(screen.getByRole('button', { name: /add member/i }));

    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/name/i), 'Nikhil Menon');
    await user.selectOptions(within(dialog).getByLabelText(/category/i), 'executive');
    await user.click(within(dialog).getByRole('button', { name: /^add member$/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create.mock.calls[0]?.[0]).toMatchObject({
      name: 'Nikhil Menon',
      category: 'executive',
    });
  });
});
