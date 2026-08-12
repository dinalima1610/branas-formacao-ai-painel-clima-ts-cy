import type { IncomingMessage, ServerResponse } from 'node:http';

import { app } from '../painel_clima_cy/backend/src/app';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  request.url = stripBasePath(request.url, '/painel_clima_cy');
  return app(request, response);
}

function stripBasePath(url: string | undefined, basePath: string): string {
  if (url === undefined) {
    return '/';
  }

  const nextUrl = url.replace(new RegExp(`^${basePath}`), '');

  return nextUrl.length > 0 ? nextUrl : '/';
}
