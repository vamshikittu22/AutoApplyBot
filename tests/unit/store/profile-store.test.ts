import { describe, it, expect } from 'vitest';
import { useProfileStore } from '@/lib/store/profile-store';

describe('Profile Store', () => {
  it('should initialize with null profile', () => {
    const { profile } = useProfileStore.getState();
    expect(profile).toBeNull();
  });

  it('should set profile', () => {
    const store = useProfileStore;
    store.getState().setProfile({
      personal: { name: 'Test User', email: 'test@example.com', phone: '555-0100' },
      isComplete: false,
    });
    
    expect(store.getState().profile?.personal.name).toBe('Test User');
  });
});
