import { buildDestinationQualityBaseline } from "../../../lib/destination-quality-baseline";

export async function GET() {
  const report = await buildDestinationQualityBaseline();
  return Response.json(report, { status: 200 });
}