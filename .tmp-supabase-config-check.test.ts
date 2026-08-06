import { describe, it } from 'vitest';
import { isSupabaseConfigured, getSupabaseConfig, supabaseFetch } from './app/lib/supabase';

const shouldRunLiveSupabaseCheck = Boolean(process.env.HORIZON_ATLAS_ALLOW_SUPABASE_NETWORK);

describe('supabase config check', () => {
  it.skipIf(!shouldRunLiveSupabaseCheck)('prints config state', async () => {
    console.log({
      isConfigured: isSupabaseConfigured(),
      config: (() => {
        try { return getSupabaseConfig(); } catch (error) { return String(error); }
      })(),
    });
    const response = await supabaseFetch('/rest/v1/destinations_catalog?select=id,slug&slug=eq.spearfish-south-dakota-united-states&limit=1', { cache: 'no-store' });
    console.log({ status: response.status, ok: response.ok, text: await response.text() });
  });
});
