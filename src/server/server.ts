import { serve } from "bun";
import { join } from "path";
import { readFile } from "node:fs/promises";

const BASE_PORT = 5750;
const MAX_PORT_ATTEMPTS = 10;
const DIST_DIR = "./dist"; // Adjust this path if your Vite outDir is different

async function startServer(port: number, attempt = 0) {
  if (attempt >= MAX_PORT_ATTEMPTS) {
    console.error(`Failed to find an available port after ${MAX_PORT_ATTEMPTS} attempts.`);
    process.exit(1);
  }

  try {
    const server = serve({
      port: port,
      async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url);
        let filePath = join(DIST_DIR, url.pathname);

        try {
          // If the path doesn't have an extension, assume it's a route and serve index.html
          if (!filePath.includes('.')) {
            filePath = join(DIST_DIR, 'index.html');
          }

          const file = await readFile(filePath);
          const contentType = getContentType(filePath);
          return new Response(file, { headers: { "Content-Type": contentType } });
        } catch (error) {
          // If file not found, serve index.html for client-side routing
          try {
            const indexHtml = await readFile(join(DIST_DIR, "index.html"));
            return new Response(indexHtml, { headers: { "Content-Type": "text/html" } });
          } catch (error) {
            return new Response("Not Found", { status: 404 });
          }
        }
      },
    });

    console.log(`Listening on http://localhost:${port}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}`);
      startServer(port + 1, attempt + 1);
    } else {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

startServer(BASE_PORT);

// Error handling
process.on("unhandledRejection", (reason: unknown): void => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error: Error): void => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
