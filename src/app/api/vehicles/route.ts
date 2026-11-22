import { NextResponse, type NextRequest } from 'next/server';
import {
  inferCategoryFromModelName,
  POPULAR_VEHICLES,
} from '@/lib/seed-data';
import { createServiceRoleClient } from '@/lib/supabase/server';

const POPULAR_MAKES = Array.from(new Set(POPULAR_VEHICLES.map((v) => v.make))).sort();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action') ?? 'makes';
  const query = (searchParams.get('q') ?? '').trim();
  const make = (searchParams.get('make') ?? '').trim();
  const yearStr = searchParams.get('year');
  const year = yearStr ? Number(yearStr) : new Date().getFullYear();

  if (action === 'search' && query.length >= 2) {
    const tokens = query.toLowerCase().split(/\s+/);
    const yearToken = tokens.find((t) => /^(199\d|20[0-3]\d)$/.test(t));
    const textTokens = tokens.filter((t) => t !== yearToken);

    const matches = POPULAR_VEHICLES.filter((v) => {
      const hay = `${v.make} ${v.model}`.toLowerCase();
      return textTokens.every((t) => hay.includes(t));
    })
      .slice(0, 12)
      .map((v) => ({
        year: yearToken ? Number(yearToken) : null,
        make: v.make,
        model: v.model,
        categoryKey: v.categoryKey,
      }));

    return NextResponse.json({ results: matches });
  }

  if (action === 'makes') {
    return NextResponse.json({ makes: POPULAR_MAKES });
  }

  if (action === 'models' && make) {
    const cacheKey = `vpic:${make.toLowerCase()}:${year}`;
    const supabase = createServiceRoleClient();

    // 1. Check Supabase cache first
    if (supabase) {
      const { data: cached } = await supabase
        .from('nhtsa_cache')
        .select('payload, expires_at')
        .eq('cache_key', cacheKey)
        .maybeSingle();

      if (cached && new Date(cached.expires_at).getTime() > Date.now()) {
        return NextResponse.json({ models: cached.payload, source: 'cache' });
      }
    }

    // 2. Try NHTSA vPIC public API
    try {
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(
        make,
      )}/modelyear/${encodeURIComponent(String(year))}?format=json`;
      const res = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const json = (await res.json()) as { Results?: Array<{ Model_Name: string }> };
        const uniqueModels = Array.from(
          new Set((json.Results ?? []).map((r) => r.Model_Name?.trim()).filter(Boolean)),
        )
          .sort()
          .map((modelName) => ({
            model: modelName,
            categoryKey: inferCategoryFromModelName(modelName),
          }));

        if (uniqueModels.length > 0) {
          if (supabase) {
            const expiresAt = new Date(Date.now() + 30 * 86400_000).toISOString();
            await supabase
              .from('nhtsa_cache')
              .upsert({ cache_key: cacheKey, payload: uniqueModels, expires_at: expiresAt });
          }
          return NextResponse.json({ models: uniqueModels, source: 'nhtsa' });
        }
      }
    } catch {
      // Fall through cleanly to local fallback
    }

    // 3. Fallback to popular models for this make
    const fallbackModels = POPULAR_VEHICLES.filter(
      (v) => v.make.toLowerCase() === make.toLowerCase(),
    ).map((v) => ({
      model: v.model,
      categoryKey: v.categoryKey,
    }));

    return NextResponse.json({ models: fallbackModels, source: 'fallback' });
  }

  return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
}
