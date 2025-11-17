/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TeamService Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { TeamService } from '../TeamService';
import { ObjectId } from 'mongodb';

vi.mock('../UserService', () => ({
  userService: {
    getUserById: vi.fn(),
  },
}));

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    service = new TeamService();
  });

  it('should instantiate service', () => {
    expect(service).toBeDefined();
  });

  it('should create a team', async () => {
    const team = await service.createTeam('Test Team', 'manager-123', []);
    expect(team.name).toBe('Test Team');
    expect(team.managerId).toBe('manager-123');
    expect(team.memberIds).toEqual([]);
  });
});
