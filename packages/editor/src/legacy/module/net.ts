import { fs } from './global.ts';
import axios, { type AxiosRequestConfig } from 'axios';

const proxyRewrite = (url: string): string => {
	if (!(import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) return url;
	const rawMatch = url.match(/https:\/\/raw\.githubusercontent\.com(\/.*)$/);
	if (rawMatch) return '/github-raw' + rawMatch[1];
	const jsdelivrMatch = url.match(/https:\/\/cdn\.jsdelivr\.net(\/.*)$/);
	if (jsdelivrMatch) return '/jsdelivr' + jsdelivrMatch[1];
	return url;
};

class _NetInstance {
	public get = (url: string, config?: AxiosRequestConfig) => axios.get(proxyRewrite(url), config);
	public post = (url: string, data?: unknown, config?: AxiosRequestConfig) =>
		axios.post(proxyRewrite(url), data, config);
	public isCancel = (token: unknown) => axios.isCancel(token);
	cancelQueue: { cancel: (msg?: string) => void }[] = [];

	constructor() {
		window.addEventListener('beforeunload', () => this.cancelAllDownloads());
	}

	async downloadFileWithProgress({
		url,
		outputPath,
		onProgress,
		onCancelToken,
		method = 'get'
	}: {
		url: string;
		outputPath: string;
		onProgress: (progressEvent: unknown) => void;
		onCancelToken: (cb: () => void) => void;
		method?: string;
	}) {
		const source = axios.CancelToken.source();

		this.cancelQueue.push(source);

		if (onCancelToken) {
			onCancelToken(() => source.cancel('用户主动取消下载'));
		}

		try {
			const response = await axios({
				method,
				url,
				responseType: 'blob',
				cancelToken: source.token,
				onDownloadProgress: (progressEvent: unknown) => {
					if (onProgress) {
						onProgress(progressEvent);
					}
				}
			});

			this.cancelQueue = this.cancelQueue.filter((item) => item !== source);

			if (outputPath) {
				const arrayBuffer = await response.data.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				return fs.writeFileSync(outputPath, buffer);
			} else {
				const arrayBuffer = await response.data.arrayBuffer();
				return Buffer.from(arrayBuffer);
			}
		} catch (err) {
			this.cancelQueue = this.cancelQueue.filter((item) => item !== source);

			if (axios.isCancel(err)) {
				console.log('下载已取消：', (err as { message?: string }).message);
			} else {
				console.error('下载出错：', err);
			}
			throw err;
		}
	}

	cancelAllDownloads() {
		this.cancelQueue.forEach((source) => {
			source.cancel('取消所有下载');
		});
		this.cancelQueue = [];
	}
}

export const Net = new _NetInstance();
