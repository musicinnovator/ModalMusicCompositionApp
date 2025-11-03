import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
// ADDITIVE: Import subscription routes
import subscriptionApp from "./subscription-routes.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c0ac5ce8/health", (c) => {
  return c.json({ status: "ok" });
});

// ADDITIVE: Mount subscription routes
app.route("/make-server-c0ac5ce8", subscriptionApp);

Deno.serve(app.fetch);