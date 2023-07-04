import { IsLoggedInGuard } from './users.guard';

describe('IsLoggedInGuard', () => {
  it('should be defined', () => {
    expect(new IsLoggedInGuard()).toBeDefined();
  });
});
