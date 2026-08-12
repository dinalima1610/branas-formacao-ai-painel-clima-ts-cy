import type { IncomingMessage, ServerResponse } from 'node:http';

import { createApp } from '../painel_clima/backend/src/app';

const allowedOrigin = 'https://dinalima1610.github.io';
const allowedMethods = 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS';
const allowedHeaders = 'Content-Type, Authorization';
const app = createApp();

export default function handler(request: IncomingMessage, response: ServerResponse) {
  applyCorsHeaders(response);

  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  request.url = stripBasePath(request.url, '/painel_clima');
  return app(request, response);
}

function applyCorsHeaders(response: ServerResponse): void {
  const setHeader = response.setHeader.bind(response);

  response.setHeader = (name: string, value: number | string | readonly string[]) => {
    const normalizedName = name.toLowerCase();

    if (normalizedName === 'access-control-allow-origin') {
      return setHeader(name, allowedOrigin);
    }

    if (normalizedName === 'access-control-allow-methods') {
      return setHeader(name, allowedMethods);
    }

    if (normalizedName === 'access-control-allow-headers') {
      return setHeader(name, allowedHeaders);
    }

    return setHeader(name, value);
  };

  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', allowedMethods);
  response.setHeader('Access-Control-Allow-Headers', allowedHeaders);
  response.setHeader('Vary', 'Origin');
}

function stripBasePath(url: string | undefined, basePath: string): string {
  if (url === undefined) {
    return '/';
  }

  const nextUrl = url.replace(new RegExp(`^${basePath}`), '');

  return nextUrl.length > 0 ? nextUrl : '/';
}
