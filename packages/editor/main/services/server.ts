import Koa from 'koa';
import Mime from 'mime-types';
import QRCode from 'qrcode';
import { ipcMain } from 'electron';
import { CHANNELS } from '../../src/services/ipc/channels.ts';
import type { ServerConfig } from '../../src/services/ipc/channels.ts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { IpcMainInvokeEvent } from '../types/main.ts';

let isServerState = false;

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

export const startServer = (event: IpcMainInvokeEvent, config: ServerConfig) => {
	const basePath = path.dirname(config.path);
	const instanceServer = new Koa();
	instanceServer.use(
		async (ctx: {
			path: string;
			set: (key: string, value: string | false) => void;
			body: unknown;
		}) => {
			try {
				const filePath = path.join(basePath, '.preview', ctx.path);
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
		}
	);

	const server = instanceServer.listen(config.port, () => {
		isServerState = true;
		console.log(`Start Server on http://localhost:${config.port}.`);
	});

	ipcMain.handleOnce(CHANNELS.invoke.stopServer, () => {
		isServerState = false;
		server.close();
		instanceServer.emit('close');
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
