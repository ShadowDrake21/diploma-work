import { IUser } from '@models/user.model';
import { AuthorNamePipe } from './author-name.pipe';
import { UserRole } from '@shared/enums/user.enum';

describe('AuthorNamePipe', () => {
  const pipe = new AuthorNamePipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return null when users are not provided', () => {
    expect(pipe.transform(1, null)).toBeNull();
    expect(pipe.transform(1, undefined)).toBeNull();
  });

  it('should return empty string when user not found', () => {
    const users: IUser[] = [
      {
        id: 2,
        username: 'test',
        email: 'test@example.com',
        role: UserRole.USER,
        affiliation: 'Test University',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: false,
      },
    ];
    expect(pipe.transform(1, users)).toBe('');
  });

  it('should return username when user found', () => {
    const users: IUser[] = [
      {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        role: UserRole.USER,
        affiliation: 'Test University',
        publicationCount: 1,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
      {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        role: UserRole.USER,
        affiliation: 'Test University',
        publicationCount: 2,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
    ];
    expect(pipe.transform(1, users)).toBe('user1');
  });
});
