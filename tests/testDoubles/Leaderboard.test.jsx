// Test doubles overview:
// - Stub: Controllable replacement that returns predetermined values. 
//    fetchUsers is stubbed via jest.mock and mockResolvedValue to give mock data
// - Spy: Observes calls to a real function 
//    this test relies on the stubbed fetchUsers and assert calls
// - Mock: Test doubles that both stub behavior and record calls. 
//  jest.mock creates a module mock
// - Fake: A working but simplified implementation. Not used here.

import { getSortedUsers, fetchUsers, getTop3DisplayOrder, getRankMeta, isTop10, getAvatarProps, renderRankIcon, isCurrentUser } from '../../src/components/LeaderboardLogic.jsx';

// Mock only fetchUsers from the LeaderboardLogic module
jest.mock('../../src/components/LeaderboardLogic.jsx', () => {
  const actual = jest.requireActual('../../src/components/LeaderboardLogic.jsx');
  return {
    ...actual,
    fetchUsers: jest.fn(),
  };
});

describe('Leaderboard logic test doubles', () => {
  test('getSortedUsers sorts users by totalPoints descending', () => {
    const users = [
      { id: '1', name: 'Alice', totalPoints: 10 },
      { id: '2', name: 'Bob', totalPoints: 30 },
      { id: '3', name: 'Carol', totalPoints: 20 },
    ];

    const sorted = getSortedUsers(users);
    expect(sorted.map(u => u.totalPoints)).toEqual([30, 20, 10]);
  });

  test('fetchUsers can be stubbed for UI tests', async () => {
    fetchUsers.mockResolvedValue([
      { id: '2', name: 'Bob', totalPoints: 30 },
      { id: '3', name: 'Carol', totalPoints: 20 },
      { id: '1', name: 'Alice', totalPoints: 10 },
    ]);

    const result = await fetchUsers();
    expect(fetchUsers).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Bob');
  });

  test('getTop3DisplayOrder returns [2nd, 1st, 3rd] positions', () => {
    const users = [
      { id: '1', name: 'Alice', totalPoints: 50 },
      { id: '2', name: 'Bob', totalPoints: 100 },
      { id: '3', name: 'Carol', totalPoints: 75 },
      { id: '4', name: 'Dan', totalPoints: 10 },
    ];
    const sorted = getSortedUsers(users);
    const displayOrder = getTop3DisplayOrder(sorted);
    const ranks = displayOrder.map(r => r.rank);
    const names = displayOrder.map(r => r.user.name);

    expect(ranks).toEqual([2, 1, 3]);
    expect(names).toEqual(['Carol', 'Bob', 'Alice']);
  });

  test('getRankMeta returns correct icon and badge metadata', () => {
    expect(getRankMeta(1)).toEqual({ icon: 'trophy', badge: { label: 'Champion', variantClass: 'badge-champion' } });
    expect(getRankMeta(2)).toEqual({ icon: 'medal', badge: { label: 'Runner-up', variantClass: 'badge-runnerup' } });
    expect(getRankMeta(3)).toEqual({ icon: 'award', badge: { label: '3rd Place', variantClass: 'badge-third' } });
    expect(getRankMeta(4)).toEqual({ icon: null, badge: null });
  });

  test('isTop10 detects ranks within top 10', () => {
    expect(isTop10(1)).toBe(true);
    expect(isTop10(10)).toBe(true);
    expect(isTop10(11)).toBe(false);
  });

  test('getAvatarProps derives id, displayName, avatar, and fallbackChar', () => {
    const user = { _id: 'abc123', firstName: 'Test', lastName: 'User', totalPoints: 5 };
    const props = getAvatarProps(user);
    expect(props.id).toBe('abc123');
    expect(props.displayName).toBe('Test User');
    expect(typeof props.avatar).toBe('string');
    expect(props.avatar).toContain('dicebear');
    expect(props.fallbackChar).toBe('T');

    const user2 = { id: 'id2', name: 'Jane Doe' };
    const props2 = getAvatarProps(user2);
    expect(props2.id).toBe('id2');
    expect(props2.displayName).toBe('Jane Doe');
    expect(props2.fallbackChar).toBe('J');
  });

  test('renderRankIcon returns element for known icons and null otherwise', () => {
    const trophyEl = renderRankIcon('trophy');
    const medalEl = renderRankIcon('medal');
    const awardEl = renderRankIcon('award');
    const noneEl = renderRankIcon('unknown');

    expect(trophyEl).toBeTruthy();
    expect(medalEl).toBeTruthy();
    expect(awardEl).toBeTruthy();
    expect(noneEl).toBeNull();
  });

  describe('isCurrentUser', () => {
    const originalLocalStorage = global.localStorage;

    beforeAll(() => {
      // Provide a simple localStorage mock if not present
      if (!global.localStorage) {
        const store = new Map();
        global.localStorage = {
          getItem: (k) => (store.has(k) ? store.get(k) : null),
          setItem: (k, v) => store.set(k, String(v)),
          removeItem: (k) => store.delete(k),
          clear: () => store.clear(),
        };
      }
    });

    afterAll(() => {
      global.localStorage = originalLocalStorage;
    });

    test('returns true when currentUser full name matches case-insensitively', () => {
      const currentUser = { firstName: 'Jane', lastName: 'Doe' };
      global.localStorage.setItem('currentUser', JSON.stringify(currentUser));
      expect(isCurrentUser('jane doe')).toBe(true);
      expect(isCurrentUser('Jane Doe')).toBe(true);
    });

    test('returns false when localStorage missing or name mismatch', () => {
      global.localStorage.removeItem('currentUser');
      expect(isCurrentUser('Anyone')).toBe(false);

      const u = { firstName: 'John', lastName: 'Smith' };
      global.localStorage.setItem('currentUser', JSON.stringify(u));
      expect(isCurrentUser('Jane Doe')).toBe(false);
    });

    test('returns false on malformed JSON', () => {
      global.localStorage.setItem('currentUser', '{bad json');
      expect(isCurrentUser('Jane Doe')).toBe(false);
    });
  });
});