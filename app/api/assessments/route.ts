import { cookies } from "next/headers";
import {
  deserializeRetirementDnaAnswers,
  serializeRetirementDnaAnswers,
  type RetirementDnaProfile,
} from "../../lib/retirement-dna";
import { getSupabaseConfig, isSupabaseConfigured } from "../../lib/supabase";

type AssessmentPayload = {
  answersEncoded?: string;
  profile?: RetirementDnaProfile;
  topSlugs?: string[];
};

type AssessmentRow = {
  id: string;
  created_at: string;
  answers: Record<string, number>;
  profile: RetirementDnaProfile;
};

type RecommendationRow = {
  assessment_id: string | null;
  top_slugs: string[];
  summary: { answersEncoded?: string };
};

type AuthUser = {
  id: string;
};

const normalizeSlugs = (slugs: string[] = []) =>
  Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean))).slice(0, 10);

async function getAuthedUser(): Promise<{ accessToken: string | null; user: AuthUser | null }> {
  if (!isSupabaseConfigured()) {
    return { accessToken: null, user: null };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ha-access-token")?.value;

  if (!accessToken) {
    return { accessToken: null, user: null };
  }

  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { accessToken: null, user: null };
  }

  return { accessToken, user: (await response.json()) as AuthUser };
}

export async function GET() {
  try {
    const { accessToken, user } = await getAuthedUser();

    if (!accessToken || !user) {
      return Response.json({ authenticated: false, records: [] }, { status: 200 });
    }

    const { url, anonKey } = getSupabaseConfig();
    const [assessmentsResponse, recommendationsResponse] = await Promise.all([
      fetch(
        `${url}/rest/v1/retirement_dna_assessments?select=id,created_at,answers,profile&user_id=eq.${user.id}&order=created_at.desc&limit=12`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      ),
      fetch(
        `${url}/rest/v1/saved_recommendation_sets?select=assessment_id,top_slugs,summary&user_id=eq.${user.id}&order=created_at.desc&limit=24`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      ),
    ]);

    if (!assessmentsResponse.ok) {
      return Response.json({ authenticated: true, records: [] }, { status: 200 });
    }

    const assessments = (await assessmentsResponse.json()) as AssessmentRow[];
    const recommendations = recommendationsResponse.ok
      ? ((await recommendationsResponse.json()) as RecommendationRow[])
      : [];

    const topSlugsByAssessmentId = new Map<string, string[]>();
    recommendations.forEach((row) => {
      if (!row.assessment_id || topSlugsByAssessmentId.has(row.assessment_id)) return;
      topSlugsByAssessmentId.set(row.assessment_id, normalizeSlugs(row.top_slugs ?? []));
    });

    const records = assessments.map((row) => {
      const encodedFromSummary = recommendations.find((item) => item.assessment_id === row.id)?.summary?.answersEncoded;
      const answersEncoded = encodedFromSummary ?? serializeRetirementDnaAnswers(row.answers ?? {});
      return {
        id: row.id,
        createdAt: row.created_at,
        answersEncoded,
        profile: row.profile,
        topSlugs: topSlugsByAssessmentId.get(row.id) ?? [],
      };
    });

    return Response.json({ authenticated: true, records }, { status: 200 });
  } catch {
    return Response.json({ authenticated: false, records: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { answersEncoded = "", profile, topSlugs = [] }: AssessmentPayload = await request.json();
    const { accessToken, user } = await getAuthedUser();

    if (!accessToken || !user) {
      return Response.json({ error: "Please sign in to sync assessment history." }, { status: 401 });
    }

    if (!answersEncoded || !profile) {
      return Response.json({ error: "Invalid assessment payload." }, { status: 400 });
    }

    const answers = deserializeRetirementDnaAnswers(answersEncoded);
    const normalizedSlugs = normalizeSlugs(topSlugs);
    const { url, anonKey } = getSupabaseConfig();

    const assessmentInsert = await fetch(`${url}/rest/v1/retirement_dna_assessments`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify([
        {
          user_id: user.id,
          title: `Retirement DNA - ${new Date().toISOString().slice(0, 10)}`,
          answers,
          profile,
          completion_percent: profile.completionPercent,
        },
      ]),
    });

    if (!assessmentInsert.ok) {
      return Response.json({ error: "Unable to save assessment." }, { status: assessmentInsert.status });
    }

    const insertedRows = (await assessmentInsert.json()) as Array<{ id: string }>;
    const assessmentId = insertedRows[0]?.id;

    if (!assessmentId) {
      return Response.json({ error: "Unable to save assessment." }, { status: 500 });
    }

    const recommendationInsert = await fetch(`${url}/rest/v1/saved_recommendation_sets`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        {
          user_id: user.id,
          assessment_id: assessmentId,
          top_slugs: normalizedSlugs,
          summary: {
            answersEncoded,
            topPriorities: profile.topPriorities,
            derivedTags: profile.derivedTags,
          },
        },
      ]),
    });

    if (!recommendationInsert.ok) {
      return Response.json({ error: "Assessment saved, but recommendation set sync failed." }, { status: recommendationInsert.status });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save assessment." },
      { status: 500 },
    );
  }
}