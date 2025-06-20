import { RoleFormatPipe } from './role-format.pipe';

describe('RoleFormatPipe', () => {
  let pipe: RoleFormatPipe;

  beforeEach(() => {
    pipe = new RoleFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format snake_case to Title Case', () => {
    expect(pipe.transform('ROLE_ADMIN')).toBe('Role Admin');
    expect(pipe.transform('user_role')).toBe('User Role');
  });

  it('should handle single word roles', () => {
    expect(pipe.transform('admin')).toBe('Admin');
    expect(pipe.transform('USER')).toBe('User');
  });

  it('should handle mixed case input', () => {
    expect(pipe.transform('Role_Manager')).toBe('Role Manager');
    expect(pipe.transform('DIRECTOR_OF_OPERATIONS')).toBe(
      'Director Of Operations'
    );
  });
});
