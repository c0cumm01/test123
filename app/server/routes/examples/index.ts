import { faker } from "@faker-js/faker";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// fake temperature sensors information lat, long, temp in F, timestamp
const temperatureSensors = Array.from({ length: 985 })
  .map((_, i) => {
    return {
      sensorId: i,
      lat: faker.location.latitude(),
      long: faker.location.longitude(),
      temp: faker.number.float({ min: 30, max: 60 }),
      timestamp: Math.floor(faker.date.recent().getTime() / 1000),
    };
  })
  .sort((a, b) => a.timestamp - b.timestamp);
const hono = new Hono();
export const examplesRoute = hono.get(
  "/temperature-sensors",
  zValidator(
    "query",
    z.object({
      page: z.coerce.number().min(1).max(1000).default(1),
      pageSize: z.coerce.number().min(1).max(1000).default(1),
    }),
  ),
  async (c) => {
    const { page, pageSize } = c.req.valid("query");
    const data = temperatureSensors.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );
    return c.json({
      has_more: data.length > pageSize,
      data,
    });
  },
);
