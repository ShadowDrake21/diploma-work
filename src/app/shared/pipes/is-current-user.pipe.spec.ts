import { currentUserSig } from '@core/shared/shared-signals';
import { IsCurrentUserPipe } from './is-current-user.pipe';
import { UserRole } from '@shared/enums/user.enum';

describe('IsCurrentUserPipe', () => {
  const pipe = new IsCurrentUserPipe();

  beforeEach(() => {
    currentUserSig.set(null);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false when no current user', () => {
    expect(pipe.transform(1)).toBe(false);
  });

  it('should return false when userId is undefined', () => {
    currentUserSig.set({
      id: 1,
      username: 'test',
      email: '',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: false,
    });
    expect(pipe.transform(undefined)).toBe(false);
  });

  it('should return true when userId matches current user', () => {
    currentUserSig.set({
      id: 1,
      username: 'test',
      email: '',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: false,
    });
    expect(pipe.transform(1)).toBe(true);
  });

  it('should return false when userId does not match current user', () => {
    currentUserSig.set({
      id: 1,
      username: 'test',
      email: '',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: false,
    });
    expect(pipe.transform(2)).toBe(false);
  });
});
