import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Local OCR service pushes recognized plate here:
// POST /ocr-push  { "plate": "AA123BB", "type": "in" | "out" }
http.route({
  path: "/ocr-push",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { plate, type } = await req.json() as { plate: string; type: "in" | "out" };

    if (!plate || !type) {
      return new Response(JSON.stringify({ error: "plate and type required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const normalized = plate.toUpperCase().replace(/\s/g, "");

    const car = await ctx.runQuery(api.cars.search, { q: normalized });
    if (!car) {
      return new Response(JSON.stringify({ error: "not_found", plate: normalized }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ctx.runMutation(api.cars.logEntry, {
      carId: car._id,
      type,
      source: "ocr",
    });

    return new Response(JSON.stringify({ ok: true, plate: car.plate, cat: car.cat }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
