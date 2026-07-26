import { buildDestinationVerificationReport } from "../../../lib/destination-verification";

export async function GET() {
  const report = await buildDestinationVerificationReport();
  return Response.json(report, { status: 200 });
}
