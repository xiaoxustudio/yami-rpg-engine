import Mime from 'mime-types';
import { ipcMain } from 'electron';
import { CHANNELS } from '../../src/services/ipc/channels.ts';
import type { ServerConfig } from '../../src/services/ipc/channels.ts';
import fs from 'fs';
import type { Stats } from 'fs';
import path from 'path';
import os from 'os';
import type { Server } from 'http';
import type { IpcMainInvokeEvent } from '../types/main.ts';
import { lazyCjs } from './lazy-cjs.ts';

const loadKoa = lazyCjs<typeof import('koa')>(() => import('koa'));
const loadQRCode = lazyCjs<typeof import('qrcode')>(() => import('qrcode'));

const FSP = fs.promises;

let isServerState = false;
let instanceServer: PreviewServerApp | null = null;
let serverHandle: Server | null = null;

interface PreviewContext {
	path: string;
	status: number;
	readonly fresh: boolean;
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

export const startServer = async (
	_event: IpcMainInvokeEvent,
	config: ServerConfig
): Promise<boolean> => {
	if (isServerState) return false;
	const Koa = await loadKoa();
	const previewRoot = path.resolve(path.dirname(config.path), '.preview');
	instanceServer = new Koa();
	instanceServer!.use(async (ctx: PreviewContext) => {
		let decoded: string;
		try {
			decoded = decodeURIComponent(ctx.path);
		} catch {
			ctx.status = 400;
			ctx.body = '400 Bad Request';
			return;
		}
		const filePath = path.resolve(previewRoot, '.' + decoded);
		if (filePath !== previewRoot && !filePath.startsWith(previewRoot + path.sep)) {
			ctx.status = 404;
			ctx.body = '404 Not Found';
			return;
		}

		const target = decoded.endsWith('/') ? path.join(filePath, 'index.html') : filePath;

		let stat: Stats;
		try {
			stat = await FSP.stat(target);
		} catch {
			ctx.status = 404;
			ctx.body = '404 Not Found';
			return;
		}
		if (!stat.isFile()) {
			ctx.status = 404;
			ctx.body = '404 Not Found';
			return;
		}

		const type = Mime.lookup(path.extname(target)) || 'text/plain';
		ctx.status = 200;
		ctx.set('Content-Type', type);
		ctx.set('Last-Modified', stat.mtime.toUTCString());

		if (ctx.fresh) {
			ctx.status = 304;
			ctx.body = null;
			return;
		}

		ctx.set('Content-Length', String(stat.size));
		ctx.body = fs.createReadStream(target);
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

export const toQrcode = async (url: string) => {
	const QRCode = await loadQRCode();
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
