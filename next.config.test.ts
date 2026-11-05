// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { hasRemoteMatch } from 'next/dist/shared/lib/match-remote-pattern';
import config from './next.config';

const allowed = (src: string) => hasRemoteMatch([], config.images!.remotePatterns!, new URL(src));
const keys = ['daejeon-south-korea', 'gangneung-south-korea', 'geelong-victoria-australia', 'gyeongju-south-korea', 'kaohsiung-taiwan', 'napier-new-zealand', 'newcastle-new-south-wales-australia', 'taiping-malaysia', 'tauranga-new-zealand', 'wollongong-new-south-wales-australia'];
const projection = (path: string) => JSON.parse(readFileSync(path, 'utf8')).data.destinationMedia as Array<{key: string; heroImage: {src: string; alt: string} | null}>;

describe('approved discovery image optimizer sources', () => {
  for (const key of keys) it(`accepts the existing Explore and Smart Shortlist hero for ${key}`, () => {
    const explore = projection('data/generated-explore-projection.json').find(row => row.key === key)!;
    const shortlist = projection('data/generated-smart-shortlist-projection.json').find(row => row.key === key)!;
    expect(explore.heroImage).toBeTruthy();
    expect(shortlist.heroImage).toEqual(explore.heroImage);
    expect(allowed(explore.heroImage!.src)).toBe(true);
  });
  it('retains existing upload.wikimedia.org image support', () => {
    expect(allowed('https://upload.wikimedia.org/wikipedia/commons/a/ab/Example.jpg')).toBe(true);
  });
  it.each([
    'http://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Example.jpg',
    'https://thumb.wikimedia.org:8443/wikipedia/commons/thumb/a/ab/Example.jpg',
    'https://thumb.wikimedia.org/not-approved/Example.jpg',
    'https://thumb.wikimedia.org.evil.example/wikipedia/commons/thumb/a/ab/Example.jpg',
  ])('rejects unapproved thumbnail origins or paths: %s', src => expect(allowed(src)).toBe(false));
});
