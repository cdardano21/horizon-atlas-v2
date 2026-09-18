import { DestinationImageDeliveryError, destinationImageResponse, getDeliveredDestinationImage } from "../../lib/destination-image-delivery";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const source = new URL(request.url).searchParams.get("src");
    return destinationImageResponse(await getDeliveredDestinationImage(source));
  } catch (error) {
    const status = error instanceof DestinationImageDeliveryError ? error.status : 502;
    return Response.json({ error: "Destination image unavailable" }, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }
}