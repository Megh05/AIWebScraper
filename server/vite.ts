import { Express, Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import { resolve } from "path";
import { Server } from "http";

export function log(message: string, source = "express") {
  console.log(`${new Date().toLocaleTimeString()} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: {
      server
    },
    allowedHosts: true as true
  };

  const vite = await createViteServer({
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Serve static files
      if (url.includes(".")) {
        return next();
      }

      // Always read fresh from disk in dev
      let template = resolve("client/index.html");

      // Apply vite HTML transforms
      template = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      const err = e as Error;
      vite.ssrFixStacktrace(err);
      next(err);
    }
  });

  return vite;
}

export function serveStatic(app: Express) {
  const express = require("express");
  
  app.use(
    "/",
    (req, res, next) => {
      if (req.path.includes(".")) {
        express.static(resolve("dist/public"))(req, res, next);
      } else {
        next();
      }
    }
  );

  app.use("*", (req, res) => {
    res.sendFile(resolve("dist/public/index.html"));
  });
}