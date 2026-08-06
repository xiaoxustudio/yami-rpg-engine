import { fs } from './global.ts';
import axios from 'axios';

const proxyRewrite = (url: any) => {
	if (typeof url !== 'string' || !(import.meta as any).env?.DEV) return url;
	const rawMatch = url.match(/https:\/\/raw\.githubusercontent\.com(\/.*)$/);
	if (rawMatch) return '/github-raw' + rawMatch[1];
	const jsdelivrMatch = url.match(/https:\/\/cdn\.jsdelivr\.net(\/.*)$/);
	if (jsdelivrMatch) return '/jsdelivr' + jsdelivrMatch[1];
	return url;
};

class _NetInstance {
	public get = (url: any, config: any) => axios.get(proxyRewrite(url), config);
	public post = (url: any, data: any, config: any) => axios.post(proxyRewrite(url), data, config);
	public isCancel = (token: any) => axios.isCancel(token);
	cancelQueue: any[] = [];

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
		url: any;
		outputPath: any;
		onProgress: any;
		onCancelToken: any;
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
				onDownloadProgress: (progressEvent: any) => {
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
				console.log('下载已取消：', (err as any).message);
			} else {
				console.error('下载出错：', err);
			}
			throw err;
		}
	}

	cancelAllDownloads() {
		this.cancelQueue.forEach((source: any) => {
			source.cancel('取消所有下载');
		});
		this.cancelQueue = [];
	}
}

export const Net = new _NetInstance();
