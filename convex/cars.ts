import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const INITIAL_CARS = [
  { plate: "BT034GY", cat: "BKIS", status: "inside" as const },
  { plate: "BT611CZ", cat: "BKIS", status: "none" as const },
  { plate: "AB608EK", cat: "BKIS", status: "inside" as const },
  { plate: "BL584HU", cat: "BKIS", status: "inside" as const },
  { plate: "261PU", cat: "BKIS", status: "inside" as const },
  { plate: "231IB", cat: "BKIS", status: "inside" as const },
  { plate: "766RP", cat: "BKIS", status: "inside" as const },
  { plate: "742CS", cat: "BKIS", status: "inside" as const },
  { plate: "NM640CZ", cat: "DOUBLE AGENCY", status: "inside" as const },
  { plate: "BL786ZA", cat: "LUKI TURIAK", status: "none" as const },
  { plate: "BL622OP", cat: "ARES", status: "inside" as const },
  { plate: "BL581UH", cat: "Slovenská asociácia Frisbee", status: "none" as const },
  { plate: "BL990PL", cat: "Ma-Ya Agency", status: "none" as const },
  { plate: "MA932FF", cat: "Ma-Ya Agency", status: "none" as const },
  { plate: "PP680DK", cat: "Ma-Ya Agency", status: "inside" as const },
  { plate: "AA521XM", cat: "Ma-Ya Agency", status: "none" as const },
  { plate: "BT372DE", cat: "selfiekútik", status: "none" as const },
  { plate: "BL955VJ", cat: "catering", status: "none" as const },
  { plate: "BL996ZK", cat: "catering", status: "none" as const },
  { plate: "BT050HA", cat: "catering", status: "none" as const },
  { plate: "BL471CA", cat: "catering", status: "inside" as const },
  { plate: "AB124AN", cat: "catering", status: "none" as const },
  { plate: "BL903TS", cat: "catering", status: "inside" as const },
  { plate: "MI037BL", cat: "catering", status: "inside" as const },
  { plate: "TO376CA", cat: "catering", status: "none" as const },
  { plate: "AA208EY", cat: "catering", status: "inside" as const },
  { plate: "BA361JE", cat: "technika", status: "none" as const },
  { plate: "BA319TG", cat: "technika", status: "none" as const },
  { plate: "BA356PO", cat: "technika", status: "inside" as const },
  { plate: "BL449LO", cat: "technika", status: "none" as const },
  { plate: "BL080HR", cat: "technika", status: "none" as const },
  { plate: "AA330AU", cat: "technika", status: "none" as const },
  { plate: "KN499GJ", cat: "technika", status: "none" as const },
  { plate: "BA264NL", cat: "technika", status: "none" as const },
  { plate: "BA954NL", cat: "technika", status: "none" as const },
  { plate: "AB559FN", cat: "technika", status: "none" as const },
  { plate: "BL624AG", cat: "technika", status: "none" as const },
  { plate: "SC125GU", cat: "technika", status: "inside" as const },
  { plate: "BL126PR", cat: "Fotograf", status: "none" as const },
  { plate: "BT067DV", cat: "iHRYsko.sk", status: "none" as const },
  { plate: "TN001", cat: "dračie lode", status: "none" as const },
  { plate: "TN146HI", cat: "dračie lode", status: "none" as const },
  { plate: "TN625DH", cat: "dračie lode", status: "none" as const },
  { plate: "037LB", cat: "SBS", status: "inside" as const },
  { plate: "102IN", cat: "SBS", status: "none" as const },
  { plate: "BT386HD", cat: "multi-sport", status: "none" as const },
  { plate: "MA695DT", cat: "multi-sport", status: "none" as const },
  { plate: "AB638EC", cat: "multi-sport", status: "none" as const },
  { plate: "GA774FS", cat: "DJ", status: "inside" as const },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("cars").collect();
    if (existing.length > 0) return { seeded: false };
    for (const car of INITIAL_CARS) {
      await ctx.db.insert("cars", car);
    }
    return { seeded: true, count: INITIAL_CARS.length };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("cars").collect();
  },
});

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    if (!q) return null;
    const exact = await ctx.db
      .query("cars")
      .withIndex("by_plate", (idx) => idx.eq("plate", q))
      .first();
    if (exact) return exact;
    const all = await ctx.db.query("cars").collect();
    return all.find((c) => c.plate.includes(q)) ?? null;
  },
});

export const add = mutation({
  args: { plate: v.string(), cat: v.string() },
  handler: async (ctx, { plate, cat }) => {
    const existing = await ctx.db
      .query("cars")
      .withIndex("by_plate", (idx) => idx.eq("plate", plate))
      .first();
    if (existing) throw new Error("Vozidlo už existuje");
    return ctx.db.insert("cars", { plate, cat, status: "none" });
  },
});

export const logEntry = mutation({
  args: {
    carId: v.id("cars"),
    type: v.union(v.literal("in"), v.literal("out")),
    source: v.optional(v.union(v.literal("manual"), v.literal("ocr"))),
  },
  handler: async (ctx, { carId, type, source }) => {
    const car = await ctx.db.get(carId);
    if (!car) throw new Error("Vozidlo nenájdené");
    const newStatus = type === "in" ? "inside" : "outside";
    await ctx.db.patch(carId, { status: newStatus });
    const time = new Date().toLocaleTimeString("sk-SK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    await ctx.db.insert("events", {
      plate: car.plate,
      carId,
      type,
      time,
      source: source ?? "manual",
    });
  },
});

export const getEvents = query({
  args: { carId: v.id("cars") },
  handler: async (ctx, { carId }) => {
    return ctx.db
      .query("events")
      .withIndex("by_car", (idx) => idx.eq("carId", carId))
      .order("desc")
      .take(10);
  },
});

export const recentEvents = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("events").order("desc").take(50);
  },
});
