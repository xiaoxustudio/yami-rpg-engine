import Koa from 'koa';
import Mime from 'mime-types';
import QRCode from 'qrcode';
import { ipcMain } from 'electron';
import { CHANNELS } from '../../src/services/ipc/channels.ts';
import type { ServerConfig } from '../../src/services/ipc/channels.ts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Server } from 'http';
import type { IpcMainInvokeEvent } from '../types/main.ts';

let isServerState = false;
let instanceServer: PreviewServerApp | null = null;
let serverHandle: Server | null = null;

interface PreviewContext {
	path: string;
	set: (key: string, value: string | false) => void;
	body: unknown;
}

interface PreviewServerApp {
	use(middleware: (ctx: PreviewContext) => Promise<void>): void;
	listen(port: number, callback: () => void): Server;
}

const getLocalIpAddress = (): string[] => {
	const interfaces = os.networkInterfaces();
	const results = new Set<string>();

	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name]!) {
			if (iface.family !== 'IPv4' || iface.internal !== false) continue;

			results.add(iface.address);
		}
	}

	return Array.from(results);
};

export const getServerState = (): boolean => isServerState;

export const stopServer = (): void => {
	if (!isServerState) return;
	isServerState = false;
	serverHandle?.close();
	serverHandle = null;
	instanceServer = null;
};

ipcMain.handle(CHANNELS.invoke.stopServer, () => {
	stopServer();
});

export const startServer = (_event: IpcMainInvokeEvent, config: ServerConfig): Promise<boolean> => {
	if (isServerState) return Promise.resolve(false);
	const previewRoot = path.resolve(path.dirname(config.path), '.preview');
	instanceServer = new Koa();
	instanceServer!.use(async (ctx: PreviewContext) => {
		try {
			// 解码 + 归一化后强制落在 previewRoot 内，阻断路径穿越
			let decoded: string;
			try {
				decoded = decodeURIComponent(ctx.path);
			} catch {
				ctx.body = '400 Bad Request';
				return;
			}
			const filePath = path.resolve(previewRoot, '.' + decoded);
			if (filePath !== previewRoot && !filePath.startsWith(previewRoot + path.sep)) {
				ctx.body = '404 Not Found';
				return;
			}
			const ext = path.extname(filePath);
			const type = Mime.lookup(ext) || 'text/plain';
			if (ctx.path === '/') {
				ctx.set('Content-Type', Mime.lookup('html'));
				ctx.body = fs.readFileSync(path.join(filePath, 'index.html'));
			} else {
				ctx.set('Content-Type', type);
				ctx.body = fs.readFileSync(filePath);
			}
		} catch {
			ctx.body = '404 Not Found';
		}
	});

	return new Promise<boolean>((resolve) => {
		const server = instanceServer!.listen(config.port, () => {
			isServerState = true;
			console.log(`Start Server on http://localhost:${config.port}.`);
			resolve(true);
		});
		serverHandle = server;
		server.on('error', (error: Error) => {
			console.error(`Preview server error: ${error.message}`);
			isServerState = false;
			serverHandle = null;
			instanceServer = null;
			resolve(false);
		});
	});
};

export const toQrcode = (url: string) => {
	return QRCode.toDataURL(url, { errorCorrectionLevel: 'H' })
		.then((url: string) => {
			return url;
		})
		.catch((err: unknown) => {
			console.error(err);
		});
};

export const getLocalIp = (): string[] => {
	return getLocalIpAddress();
};
