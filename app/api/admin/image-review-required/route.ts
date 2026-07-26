import { buildDestinationVerificationReport } from "../../../lib/destination-verification";

export async function GET() {
  const report = await buildDestinationVerificationReport();

  return Response.json(
    {
      generatedAt: report.generatedAt,
      totalDestinations: report.totals.destinations,
      imageReviewRequiredCount: report.totals.imageReviewRequired,
      destinations: report.imageReviewRequired,
    },
    { status: 200 },
  );
}
