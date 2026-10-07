import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { Window } from '@app/tools/window-object.ts';
import { GlobalPath, Path } from '@app/utils/config';
import { SettingConfig } from '@app/services/project/setting-config';
import { PING_SLOW_MS, PING_WARN_MS } from '@app/constants/editor.ts';
import { getResourceStore, type ResourceRow } from '@app/stores/resource';

import { Net } from '@app/services/ipc/net.ts';
import {
	fs,
	CommunityVersion,
	PackMeta,
	TemplatesPath,
	isNoResource,
	NoResourceObj,
	unzipWithProgress,
	setPackMeta,
	setNoResourceObj
} from './global.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

export const Resources = new (class {
	private _cancels = new Map<string, () => void>();
	private _speedMarks = new Map<string, { loaded: number; time: number }>();

	_fastGithubArray = [];
	get fastGithubPrefix() {
		const config = SettingConfig.config?.github?.accelerationNode || 'auto';
		if (!this._fastGithubArray) return '';

		switch (config) {
			case 'auto':
				return (
					this._fastGithubArray[
						Math.floor(Math.random() * this._fastGithubArray.length)
					] ?? ''
				);
			case 'none':
				return '';
			default:
				const match = config.match(/^node(\d+)$/);
				if (match) {
					const index = parseInt(match[1]) - 1;
					if (index >= 0 && index < this._fastGithubArray.length) {
						return this._fastGithubArray[index];
					}
				}
				return this._fastGithubArray[0] ?? '';
		}
	}

	loaded = false;

	constructor() {
		void this.updateFastGithubArray().then((data) => {
			this._fastGithubArray = data;
		});
	}

	async updateFastGithubArray() {
		const url =
			'https://cdn.jsdelivr.net/gh/Open-Yami-Community/yami-rpg-editor@main/jsons/fastGithubArray.json';
		try {
			const response = await fetch(url, {
				cache: 'no-cache',
				headers: {
					Accept: 'application/json'
				}
			});

			if (!response.ok) return [];
			return await response.json();
		} catch (err) {
			console.warn('获取失败', err);
			return [];
		}
	}

	async initialize() {
		void this.updateNodeInfo();
	}

	/** 「打开目录」按钮（原为 initialize() 里注册到 resource-open-dir 元素上的 click） */
	openDir() {
		YamiIpc.send.openPath(GlobalPath);
	}

	getCurrentNodeInfo() {
		const config = SettingConfig.config?.github?.accelerationNode || 'auto';
		if (!this._fastGithubArray) return { nodeName: '', nodeUrl: '' };
		const get = (key: string) => t('confirmation.' + key);

		let nodeName = '';
		let nodeUrl = '';

		switch (config) {
			case 'auto':
				nodeName = get('github-acceleration-auto') || '自动选择';
				nodeUrl = this.fastGithubPrefix;
				break;
			case 'none':
				nodeName = get('github-acceleration-none') || '不使用加速';
				nodeUrl = 'https://raw.githubusercontent.com/';
				break;
			default:
				const match = config.match(/^node(\d+)$/);
				if (match) {
					const index = parseInt(match[1]) - 1;
					if (index >= 0 && index < this._fastGithubArray.length) {
						nodeUrl = this._fastGithubArray[index];
						const domain = nodeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
						const nodeLabel = get('github-acceleration-node') || '节点';
						nodeName = `${nodeLabel} ${index + 1} (${domain})`;
					}
				}
				break;
		}

		return { nodeName, nodeUrl };
	}

	async getRemoteAnnouncement() {
		try {
			const response = await fetch(
				'https://api.github.com/repos/Open-Yami-Community/yami-rpg-editor/releases'
			);
			if (!response.ok) throw new Error('Failed to fetch announcement');
			const jj = await response.json();
			return jj[jj.length - 1].body;
		} catch (error: unknown) {
			console.warn('Failed to load community announcement:', error);
			return '';
		}
	}

	getFirstAnnouncementContent(text: string) {
		if (!text) return '';

		const lines = text.split('\n');
		const contentLines = [];
		let foundFirstDate = false;

		const dateRegex = /^\s*\d{4}-\d{2}-\d{2}/;

		for (const line of lines) {
			const isDateLine = dateRegex.test(line);

			if (isDateLine) {
				if (!foundFirstDate) {
					foundFirstDate = true;
					continue;
				} else {
					break;
				}
			}

			if (foundFirstDate) {
				contentLines.push(line);
			}
		}

		return contentLines.join('\n').trim();
	}

	async pingNode(url: string) {
		if (!url) return -1;

		const startTime = Date.now();
		try {
			const testUrl = `${url}Open-Yami-Community/yami-rpg-editor/refs/heads/main/pack.json`;
			const response = await fetch(testUrl, {
				method: 'HEAD',
				cache: 'no-cache'
			});

			if (response.ok) {
				return Date.now() - startTime;
			}
			return -1;
		} catch (error: unknown) {
			console.warn('Ping failed:', error);
			return -1;
		}
	}

	async updateNodeInfo() {
		const store = getResourceStore();
		const { nodeName, nodeUrl } = this.getCurrentNodeInfo();
		const get = (key: string) => t('confirmation.' + key);

		const nodeLabel = get('resource-current-node-label') || '当前节点';
		store.setNodeText(`${nodeLabel}: ${nodeName}`);

		const testingLabel = get('resource-node-ping-testing') || '测试中';
		store.setPing(`Ping: ${testingLabel}...`, '#888');

		const ping = await this.pingNode(nodeUrl);

		if (ping >= 0) {
			let color = '#4caf50';
			if (ping > PING_WARN_MS) {
				color = '#f44336';
			} else if (ping > PING_SLOW_MS) {
				color = '#ff9800';
			}
			store.setPing(`Ping: ${ping}ms`, color);
		} else {
			const failedLabel = get('resource-node-ping-failed') || '失败';
			store.setPing(`Ping: ${failedLabel}`, '#f44336');
		}
	}

	/** @description 0 版本一致 | 1 v1版本大 | -1 v2版本大 */
	compareVersions(v1: string, v2: string) {
		const normalize = (version: string) => version.replace(/^v/, '');

		const normalizedV1 = normalize(v1);
		const normalizedV2 = normalize(v2);

		const parts1 = normalizedV1.split('.').map(Number);
		const parts2 = normalizedV2.split('.').map(Number);

		const maxLength = Math.max(parts1.length, parts2.length);

		for (let i = 0; i < maxLength; i++) {
			const num1 = parts1[i] || 0;
			const num2 = parts2[i] || 0;

			if (num1 > num2) return 1;
			if (num1 < num2) return -1;
		}

		return 0;
	}

	async downloadNetMeta() {
		await this.updateFastGithubArray().then((data) => {
			this._fastGithubArray = data;
		});
		const json = `${this.fastGithubPrefix}Open-Yami-Community/yami-rpg-editor/refs/heads/main/pack.json`;
		return await Net.get(json, {
			headers: {
				type: 'application/json'
			},
			...({ cache: 'no-cache' } as Record<string, unknown>)
		}).catch((error) => {
			console.error('downloadNetMeta error:', error?.message || error);
			return { data: [] };
		});
	}

	checkResources() {
		setNoResourceObj(isNoResource());
		return (
			NoResourceObj &&
			// oxlint-disable-next-line no-explicit-any
			Object.values<any>(NoResourceObj).every((v) => (typeof v === 'boolean' ? v : v.check))
		);
	}

	formatFileSize(bytes: number) {
		if (bytes < 1024) {
			return `${bytes} B`;
		} else if (bytes < 1024 * 1024) {
			return `${(bytes / 1024).toFixed(2)} KB`;
		} else if (bytes < 1024 * 1024 * 1024) {
			return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
		} else {
			return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
		}
	}

	async getFileSize(resourceName: string) {
		try {
			const url = `https://github.com/Open-Yami-Community/yami-rpg-editor/releases/download/win/${resourceName}_pack.zip`;
			const downloadurl = `${this.fastGithubPrefix}${url}`;

			const response = await fetch(downloadurl, {
				method: 'HEAD',
				cache: 'no-cache'
			});

			if (response.ok) {
				const contentLength = response.headers.get('content-length');
				return contentLength ? parseInt(contentLength) : 0;
			}
			return 0;
		} catch (error: unknown) {
			console.warn('Failed to get file size:', error);
			return 0;
		}
	}

	readTemplate() {
		const tempPath = Path.resolve(TemplatesPath, 'template.json');
		if (!fs.existsSync(tempPath)) {
			fs.writeFileSync(tempPath, JSON.stringify(PackMeta));
			return PackMeta;
		}
		return JSON.parse(fs.readFileSync(tempPath, 'utf-8'));
	}

	writeTemplate(val: string) {
		const tempPath = Path.resolve(TemplatesPath, 'template.json');
		fs.writeFileSync(tempPath, JSON.stringify(val));
	}

	async checkEditorVersion() {
		const get = (key: string) => t('confirmation.' + key);
		const url = `${this.fastGithubPrefix}Open-Yami-Community/yami-rpg-editor/refs/heads/main/Project/Script/module/packmeta.json`;
		const jsonParse = await Net.get(url, {
			headers: {
				type: 'application/json',
				cache: 'no-cache'
			}
		}).catch((error) => {
			console.warn(`checkEditorVersion: ${error.message}`);
			return null;
		});
		if (!jsonParse) return;
		const version = jsonParse.data?.['Community'] ?? '25010100';
		let text = '';
		let isUpdate = false;
		if (CommunityVersion !== version) {
			text = `编辑器 ${CommunityVersion} -> ${version}`;
			isUpdate = true;
		}
		if (isUpdate) {
			const updateText = this.getFirstAnnouncementContent(await this.getRemoteAnnouncement());
			const updateMessage = `${text} \n${'——'.repeat(20)}\n\n${updateText}`;
			Window.confirm!(
				{
					message: `${updateMessage} \n${'——'.repeat(20)}\n 编辑器本体需要更新 \n 请到指定地址重新下载编辑器`
				},
				[
					{
						label: get('yes')
					}
				]
			);
		}
	}

	async checkVersion() {
		let isReOpen = false;
		setPackMeta(this.readTemplate());
		const netMeta = await this.downloadNetMeta();
		const jsonParse = netMeta?.data ?? [];
		const list = Object.keys(NoResourceObj);

		let versionString = '';

		for (let i of list) {
			const elem = jsonParse.find((v: { path: string }) => v.path === i);
			const elemVersion = elem?.version ?? '1.0.0';
			if (this.compareVersions(elemVersion, PackMeta?.[i] ?? '1.0.0') === 0) {
				continue;
			}
			isReOpen = true;
			versionString += `${i} ${PackMeta[i]} -> ${elemVersion}\n`;
		}

		const get = (key: string) => t('confirmation.' + key);
		if (isReOpen) {
			Window.close!('resource');
			if (
				!NoResourceObj['arpg-ts-english']?.check &&
				!NoResourceObj['arpg-ts-chinese']?.check
			) {
				void Resources.open();
			}

			Window.confirm!({ message: versionString }, [
				{
					label: get('yes')
				}
			]);
		}
		void this.checkEditorVersion();
	}

	/** 行模型初值（对应旧实现那段 HTML 模板里的初始文案） */
	private blankRow(key: string): ResourceRow {
		const sizeLabel = t('confirmation.resource-size-label') || '大小';
		return {
			key,
			value: key.replace(/[.]/g, '_'),
			version: '',
			installed: false,
			hasTemp: false,
			sizeText: `${sizeLabel}: ${t('confirmation.resource-size-unknown') || '未知'}`,
			speedText: t('confirmation.resource-speed') || '速度: 0 KB/s',
			progress: 0,
			phase: 'idle'
		};
	}

	/** 旧的 `_check()`：按模板目录状态刷新「已安装 / 版本 / 删除可用」，并清理遗留 zip */
	refreshRow(row: ResourceRow): void {
		setNoResourceObj(isNoResource());
		const tempPath = Path.resolve(TemplatesPath, row.key);
		const targetPath = Path.resolve(TemplatesPath, `${row.key}_pack.zip`);
		const installed = Boolean(NoResourceObj[row.key]?.check);
		getResourceStore().patchRow(row.key, {
			installed,
			hasTemp: fs.existsSync(tempPath),
			version: installed ? `v${PackMeta[row.key]}` : ''
		});
		if (fs.existsSync(targetPath)) void fs.unlink(targetPath);
	}

	private async fillSize(row: ResourceRow): Promise<void> {
		const get = (key: string) => t('confirmation.' + key);
		const sizeLabel = get('resource-size-label') || '大小';
		let sizeText: string;
		try {
			const size = await this.getFileSize(row.key);
			sizeText =
				size > 0
					? `${sizeLabel}: ${this.formatFileSize(size)}`
					: `${sizeLabel}: ${get('resource-size-unknown') || '未知'}`;
		} catch {
			sizeText = `${sizeLabel}: ${get('resource-size-unknown') || '未知'}`;
		}
		getResourceStore().patchRow(row.key, { sizeText });
	}

	/** 行内「下载」按钮（旧为 on(button, 'click') 内的整段流程） */
	download(key: string): void {
		const store = getResourceStore();
		const row = store.rows.find((item) => item.key === key);
		if (!row || row.phase !== 'idle') return;

		const get = (item: string) => t('confirmation.' + item);
		const targetPath = Path.resolve(TemplatesPath, `${key}_pack.zip`);
		const url = `https://github.com/Open-Yami-Community/yami-rpg-editor/releases/download/win/${key}_pack.zip`;
		const downloadurl = `${this.fastGithubPrefix}${url}`;

		store.patchRow(key, {
			phase: 'downloading',
			progress: 0,
			speedText: t('confirmation.resource-speed') || '速度: 0 KB/s'
		});
		this._speedMarks.set(key, { loaded: 0, time: Date.now() });

		Net.downloadFileWithProgress({
			url: downloadurl,
			outputPath: targetPath,
			onCancelToken: (cancel: () => void) => {
				this._cancels.set(key, cancel);
			},
			onProgress: (progressEvent: unknown) => {
				const current = store.rows.find((item) => item.key === key);
				if (!current || current.phase !== 'downloading') return;

				const ev = progressEvent as { loaded: number; total: number };
				const percent = Math.round((ev.loaded / ev.total) * 100);
				store.patchRow(key, { progress: percent });

				const mark = this._speedMarks.get(key) ?? { loaded: 0, time: Date.now() };
				const now = Date.now();
				const timeDiff = (now - mark.time) / 1000;
				const loadedDiff = ev.loaded - mark.loaded;

				if (timeDiff > 0.5) {
					const speed = loadedDiff / timeDiff;
					let speedText: string;

					if (speed < 1024) {
						speedText = `${speed.toFixed(0)} B/s`;
					} else if (speed < 1024 * 1024) {
						speedText = `${(speed / 1024).toFixed(2)} KB/s`;
					} else {
						speedText = `${(speed / 1024 / 1024).toFixed(2)} MB/s`;
					}

					const speedLabel = t('confirmation.resource-speed-label') || '速度';
					store.patchRow(key, { speedText: `${speedLabel}: ${speedText}` });
					this._speedMarks.set(key, { loaded: ev.loaded, time: now });
				}
			}
		})
			.then(() => {
				store.patchRow(key, { phase: 'decompressing' });

				unzipWithProgress({
					zipPath: targetPath,
					outputDir: Path.resolve(Path.dirname(targetPath), key),
					onProgress: (percent: number) => {
						store.patchRow(key, { progress: percent });
					}
				})
					.then(async () => {
						const remoteData = (await this.downloadNetMeta()).data;
						const j = this.readTemplate();
						j[key] =
							remoteData.find(
								(v: { path: string; version?: string }) => key === v.path
							)?.version ?? '1.0.0';
						this.writeTemplate(j);
						setPackMeta(this.readTemplate());
						store.patchRow(key, { phase: 'idle' });
						this.refreshRow(row);
					})
					.catch((e) => {
						store.patchRow(key, { phase: 'idle' });
						Window.confirm!({ message: e.message }, [{ label: get('yes') }]);
					});
			})
			.catch((e) => {
				store.patchRow(key, { phase: 'idle' });
				if (!Net.isCancel(e)) {
					Window.confirm!({ message: e.message }, [{ label: get('yes') }]);
				}
			});
	}

	/** 行内「暂停」按钮 */
	pause(key: string): void {
		const store = getResourceStore();
		const row = store.rows.find((item) => item.key === key);
		if (!row || row.phase !== 'downloading') return;

		this._cancels.get(key)?.();
		this._cancels.delete(key);
		this._speedMarks.delete(key);
		store.patchRow(key, { phase: 'idle' });
	}

	/** 行内「删除」按钮 */
	remove(key: string): void {
		const tempPath = Path.resolve(TemplatesPath, key);
		if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { recursive: true, force: true });
		const row = getResourceStore().rows.find((item) => item.key === key);
		if (row) this.refreshRow(row);
	}
	load() {
		setNoResourceObj(isNoResource());
		const store = getResourceStore();
		const rows = Object.keys(NoResourceObj).map((key) => this.blankRow(key));
		store.setRows(rows);
		for (const row of rows) {
			this.refreshRow(row);
			void this.fillSize(row);
		}
	}

	async open() {
		Window.open!('resource');
		void this.updateNodeInfo();
		this.load();
	}
})();
