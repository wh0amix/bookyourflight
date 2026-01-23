import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BookYourFlight API Documentation</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css">
      <style>
        html {
          box-sizing: border-box;
          overflow: -moz-scrollbars-vertical;
          overflow-y: scroll;
        }
        *, *:before, *:after {
          box-sizing: inherit;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .swagger-ui {
          max-width: 100%;
        }
        .topbar {
          background-color: #fbbf24;
          color: #000;
          padding: 10px;
          text-align: center;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="topbar">
        🚀 BookYourFlight API Documentation
      </div>
      <div id="swagger-ui"></div>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
      <script>
        SwaggerUIBundle({
          url: '/api/docs/openapi.json',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: "BaseLayout",
          defaultModelsExpandDepth: 1,
          deepLinking: true,
        });
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
