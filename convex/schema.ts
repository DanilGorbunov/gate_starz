import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cars: defineTable({
    plate: v.string(),
    cat: v.string(),
    status: v.union(v.literal("inside"), v.literal("outside"), v.literal("none")),
  }).index("by_plate", ["plate"]),

  events: defineTable({
    plate: v.string(),
    carId: v.id("cars"),
    type: v.union(v.literal("in"), v.literal("out")),
    time: v.string(),
    source: v.optional(v.union(v.literal("manual"), v.literal("ocr"))),
  })
    .index("by_car", ["carId"])
    .index("by_plate_type", ["plate", "type"]),
});
