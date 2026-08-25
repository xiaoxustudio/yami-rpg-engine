import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import type { Connect, Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

// dev 模式返回空 sourcemap，避免 electron 加载渲染层时请求缺失的 .map
export function sourcemapStub(): Plugin {
	return {
		name: 'sourcemap-stub',
		configureServer(server: ViteDevServer) {
			server.middlewares.use(
				(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
					if (req.url && /^\/[^/]+\.js\.map(?:\?.*)?$/.test(req.url)) {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.end('{"version":3,"sources":[],"names":[],"mappings":""}');
						return;
					}
					next();
				}
			);
		}
	};
}

// dev 模式走 /local-file/?path= 代理绕过 file:// 限制
export function localFileProxy(): Plugin {
	return {
		name: 'local-file-proxy',
		configureServer(server: ViteDevServer) {
			server.middlewares.use(
				(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
					if (!req.url?.startsWith('/local-file/')) {
						return next();
					}
					const url = new URL(req.url, 'http://localhost');
					const path = url.searchParams.get('path');
					if (!path) {
						res.statusCode = 400;
						res.end('Missing path param');
						return;
					}
					const diskPath = (
						path.startsWith('file://')
							? fileURLToPath(path)
							: path.replace(/[#?]ver=\d+$/, '')
					).replace(/[\\/]{2,}/g, '/');
					try {
						const buf = readFileSync(diskPath);
						res.setHeader('Content-Type', 'application/octet-stream');
						res.setHeader('Access-Control-Allow-Origin', '*');
						res.end(buf);
					} catch {
						res.statusCode = 404;
						res.end(`File not found: ${diskPath}`);
					}
				}
			);
		}
	};
}
