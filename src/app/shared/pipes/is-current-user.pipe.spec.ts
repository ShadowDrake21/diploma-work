import { IsCurrentUserPipe } from './is-current-user.pipe';

describe('CurrentUserPipe', () => {
  it('create an instance', () => {
    const pipe = new IsCurrentUserPipe();
    expect(pipe).toBeTruthy();
  });
});
