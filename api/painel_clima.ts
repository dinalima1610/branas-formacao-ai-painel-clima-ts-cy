import type { IncomingMessage, ServerResponse } from 'node:http';

import { createApp } from '../painel_clima/backend/src/app';

const app = createApp();

export default function handler(request: IncomingMessage, response: ServerResponse) {
  request.url = stripBasePath(request.url, '/painel_clima');
  return app(request, response);
}

function stripBasePath(url: string | undefined, basePath: string): string {
  if (url === undefined) {
    return '/';
  }

  const nextUrl = url.replace(new RegExp(`^${basePath}`), '');

  return nextUrl.length > 0 ? nextUrl : '/';
}
