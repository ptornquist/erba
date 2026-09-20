import { eventDictionary } from "@/lib/catalog";

export async function GET() {
  return Response.json({
    events: eventDictionary.map((event) => ({
      id: event.id,
      label: event.label,
    })),
  });
}
