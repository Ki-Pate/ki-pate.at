import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 43110;

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

export function parseRangeHeader(value, size) {
  if (typeof value !== 'string' || !Number.isSafeInteger(size) || size < 1) {
    return null;
  }

  const match = /^bytes=(\d*)-(\d*)$/i.exec(value.trim());

  if (!match || (!match[1] && !match[2])) {
    return null;
  }

  const [, startValue, endValue] = match;

  if (!startValue) {
    const suffixLength = Number(endValue);

    if (!Number.isSafeInteger(suffixLength) || suffixLength < 1) {
      return null;
    }

    return {
      start: Math.max(0, size - suffixLength),
      end: size - 1,
    };
  }

  const start = Number(startValue);
  const end = endValue ? Number(endValue) : size - 1;

  if (
    !Number.isSafeInteger(start)
    || !Number.isSafeInteger(end)
    || start < 0
    || end < start
    || start >= size
    || end >= size
  ) {
    return null;
  }

  return { start, end };
}

function isInside(root, candidate) {
  const pathFromRoot = relative(root, candidate);

  return pathFromRoot === ''
    || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..' && !isAbsolute(pathFromRoot));
}

function writeText(response, statusCode, message, extraHeaders = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  response.end(message);
}

async function resolveFile(root, requestUrl) {
  let pathname;

  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://preview.local').pathname);
  } catch {
    return null;
  }

  if (pathname.includes('\0')) {
    return null;
  }

  const requestedPath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  let candidate = resolve(root, `.${requestedPath}`);

  if (!isInside(root, candidate)) {
    return null;
  }

  let details;

  try {
    details = await stat(candidate);
    if (details.isDirectory()) {
      candidate = resolve(candidate, 'index.html');
      details = await stat(candidate);
    }

    if (!details.isFile()) {
      return null;
    }

    const [realRoot, realCandidate] = await Promise.all([realpath(root), realpath(candidate)]);
    if (!isInside(realRoot, realCandidate)) {
      return null;
    }

    return { path: realCandidate, size: details.size };
  } catch {
    return null;
  }
}

async function handleRequest(root, request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    writeText(response, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
    return;
  }

  const file = await resolveFile(root, request.url ?? '/');

  if (!file) {
    writeText(response, 404, 'Not Found');
    return;
  }

  const contentType = MIME_TYPES.get(extname(file.path).toLowerCase())
    ?? 'application/octet-stream';
  const version = new URL(request.url ?? '/', 'http://preview.local').searchParams.get('v');
  const cacheControl = contentType === 'video/mp4' && /^[a-f0-9]{64}$/i.test(version ?? '')
    ? 'public, max-age=31536000, immutable'
    : 'no-store';
  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': cacheControl,
    'Content-Type': contentType,
  };
  let statusCode = 200;
  let start = 0;
  let end = file.size - 1;

  if (request.headers.range) {
    const range = parseRangeHeader(request.headers.range, file.size);

    if (!range) {
      writeText(response, 416, 'Range Not Satisfiable', {
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes */${file.size}`,
      });
      return;
    }

    ({ start, end } = range);
    statusCode = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${file.size}`;
  }

  headers['Content-Length'] = String(end - start + 1);
  response.writeHead(statusCode, headers);

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(file.path, { start, end }).pipe(response);
}

export function createPreviewServer({
  root = resolve('.preview'),
  port = DEFAULT_PORT,
  host = DEFAULT_HOST,
} = {}) {
  const resolvedRoot = resolve(root);
  const server = createServer((request, response) => {
    handleRequest(resolvedRoot, request, response).catch(() => {
      if (!response.headersSent) {
        writeText(response, 500, 'Internal Server Error');
      } else {
        response.destroy();
      }
    });
  });

  server.listen(port, host);
  return server;
}

const isDirectRun = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const root = process.env.PREVIEW_ROOT ?? resolve('.preview');
  const host = process.env.HOST ?? DEFAULT_HOST;
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const server = createPreviewServer({ root, port, host });

  server.on('listening', () => {
    const address = server.address();
    const activePort = typeof address === 'object' && address ? address.port : port;
    console.log(`KI-Pate preview: http://${host}:${activePort}`);
  });
}
