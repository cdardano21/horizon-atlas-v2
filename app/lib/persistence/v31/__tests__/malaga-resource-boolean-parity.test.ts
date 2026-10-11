import { describe, expect, it } from 'vitest';
import { projectKeyedChildComparableRow } from '../comparable-projection';
describe('Resource official flag database parity', () => {
  it.each([['1', 'true'], ['0', 'false']])('compares authored %s with persisted %s without losing the flag', (authored, persisted) => {
    const source = projectKeyedChildComparableRow('resources', { resource_key: 'resource', official: authored });
    expect(source).toEqual(projectKeyedChildComparableRow('resources', { resourceKey: 'resource', official: persisted }));
    expect(source).not.toEqual(projectKeyedChildComparableRow('resources', { resourceKey: 'resource', official: authored === '1' ? 'false' : 'true' }));
    expect(source).not.toEqual(projectKeyedChildComparableRow('resources', { resourceKey: 'resource', official: null }));
  });
});
