import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { Window } from '@app/tools/window-object.ts';
import { GlobalPath, Path } from '@app/utils/config';
import { SettingConfig } from '@app/services/project/setting-config';
import { PING_SLOW_MS, PING_WARN_MS } from '@app/constants/editor.ts';
import { getResourceStore, type ResourceRow } from '@app/stores/resource';
import { RESOURCE_REPO, fetchResourceReleases, type RemoteResource } from './resource-release.ts';

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

async function sha256Hex(data: Uint8Array): Promise<string> {
	const bytes = new Uint8Array(data.length);
	bytes.set(data);
	const digest = await crypto.subtle.digest('SHA-256', bytes.buffer as ArrayBuffer);
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const Resources = new (class {
	private _cancels = new Map<string, () => void>();
	private _speedMarks = new Map<string, { loaded: number; time: number }>();
	private remoteResources = new Map<string, RemoteResource>();

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

	async refreshRemote() {
		const store = getResourceStore();
		store.setNodeText(`GitHub: ${RESOURCE_REPO.owner}/${RESOURCE_REPO.repo}`);
		store.setPing('Ping: 正在连接 GitHub...', '#888');
		const start = Date.now();
		try {
			const resources = await fetchResourceReleases();
			this.remoteResources = new Map(resources.map((item) => [item.key, item]));
			this.mergeRows();
			const ping = Date.now() - start;
			const color =
				ping > PING_WARN_MS ? '#f44336' : ping > PING_SLOW_MS ? '#ff9800' : '#4caf50';
			store.setPing(`Ping: ${ping}ms`, color);
		} catch (error: unknown) {
			store.setPing('Ping: GitHub API 失败', '#f44336');
			console.warn('fetchResourceReleases failed:', error);
		}
	}

	private mergeRows() {
		setNoResourceObj(isNoResource());
		const keys = new Set(Object.keys(NoResourceObj));
		for (const key of this.remoteResources.keys()) keys.add(key);
		const rows = [...keys].map((key) => this.blankRow(key));
		getResourceStore().setRows(rows);
		for (const row of rows) this.refreshRow(row);
	}

	private async resolveSha256(remote: RemoteResource): Promise<string> {
		if (remote.sha256) return remote.sha256;
		if (!remote.manifestUrl) return '';
		try {
			const response = await Net.get(remote.manifestUrl, {
				headers: { Accept: 'application/json' }
			});
			return typeof response.data?.sha256 === 'string' ? response.data.sha256 : '';
		} catch (error: unknown) {
			console.warn('读取资源 manifest 失败:', error);
			return '';
		}
	}

	async initialize() {
		void this.refreshRemote();
	}

	/** 「打开目录」按钮（原为 initialize() 里注册到 resource-open-dir 元素上的 click） */
	openDir() {
		YamiIpc.send.openPath(GlobalPath);
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

	readTemplate() {
		const tempPath = Path.resolve(TemplatesPath, 'template.json');
		if (!fs.existsSync(tempPath)) {
			fs.writeFileSync(tempPath, JSON.stringify(PackMeta));
			return PackMeta;
		}
		return JSON.parse(fs.readFileSync(tempPath, 'utf-8'));
	}

	writeTemplate(val: Record<string, string>) {
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
		setPackMeta(this.readTemplate());
		const get = (key: string) => t('confirmation.' + key);
		try {
			const resources = await fetchResourceReleases(true);
			this.remoteResources = new Map(resources.map((item) => [item.key, item]));
			this.mergeRows();
			const updates = resources.filter((item) => {
				const local = PackMeta[item.key];
				return local !== undefined && this.compareVersions(item.version, local) > 0;
			});
			if (updates.length > 0) {
				const message = updates
					.map((item) => `${item.key} v${PackMeta[item.key]} -> v${item.version}`)
					.join('\n');
				Window.confirm!({ message }, [{ label: get('yes') }]);
			}
		} catch (error: unknown) {
			console.warn('checkVersion failed:', error);
		}
		void this.checkEditorVersion();
	}

	/** 行模型初值 */
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

	/** 按模板目录状态刷新「已安装 / 版本 / 删除可用」，并清理遗留 zip。 */
	refreshRow(row: ResourceRow): void {
		setNoResourceObj(isNoResource());
		const targetPath = Path.resolve(TemplatesPath, row.key);
		const installed = fs.existsSync(targetPath);
		const localVersion = PackMeta[row.key] ?? '';
		const remote = this.remoteResources.get(row.key);
		const updateAvailable =
			remote !== undefined &&
			(!installed || this.compareVersions(remote.version, localVersion || '0') > 0);
		const sizeLabel = t('confirmation.resource-size-label') || '大小';
		getResourceStore().patchRow(row.key, {
			installed,
			hasTemp: fs.existsSync(`${targetPath}_pack.zip`),
			version: localVersion ? `v${localVersion}` : '',
			remoteVersion: remote ? `v${remote.version}` : '',
			updateAvailable,
			sizeText: remote
				? `${sizeLabel}: ${this.formatFileSize(remote.size)}`
				: `${sizeLabel}: ${t('confirmation.resource-size-unknown') || '未知'}`
		});
		if (row.phase === 'idle' && fs.existsSync(`${targetPath}_pack.zip`)) {
			void fs.unlink(`${targetPath}_pack.zip`);
		}
	}

	download(key: string): void {
		const store = getResourceStore();
		const row = store.rows.find((item) => item.key === key);
		if (!row || row.phase !== 'idle') return;
		const remote = this.remoteResources.get(key);
		if (!remote) {
			const get = (item: string) => t('confirmation.' + item);
			Window.confirm!({ message: get('resource-not-found') }, [{ label: get('yes') }]);
			return;
		}
		void this.runDownload(key, remote);
	}

	private async runDownload(key: string, remote: RemoteResource): Promise<void> {
		const store = getResourceStore();
		const get = (item: string) => t('confirmation.' + item);
		const targetZip = Path.resolve(TemplatesPath, `${key}_pack.zip`);
		const outputDir = Path.resolve(TemplatesPath, key);
		store.patchRow(key, {
			phase: 'downloading',
			progress: 0,
			speedText: t('confirmation.resource-speed') || '速度: 0 KB/s'
		});
		this._speedMarks.set(key, { loaded: 0, time: Date.now() });

		try {
			await Net.downloadFileWithProgress({
				url: remote.url,
				outputPath: targetZip,
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
			});

			const expected = await this.resolveSha256(remote);
			if (expected) {
				const actual = await sha256Hex(new Uint8Array(fs.readFileSync(targetZip)));
				if (actual !== expected) {
					throw new Error(`资源校验失败：${key}`);
				}
			}

			store.patchRow(key, { phase: 'decompressing', progress: 0 });
			await unzipWithProgress({
				zipPath: targetZip,
				outputDir,
				onProgress: (percent: number) => {
					store.patchRow(key, { progress: percent });
				}
			});

			const template = this.readTemplate();
			template[key] = remote.version;
			this.writeTemplate(template);
			setPackMeta(this.readTemplate());
			setNoResourceObj(isNoResource());
			store.patchRow(key, { phase: 'idle' });
			const updated = store.rows.find((item) => item.key === key);
			if (updated) this.refreshRow(updated);
		} catch (error: unknown) {
			store.patchRow(key, { phase: 'idle' });
			if (!Net.isCancel(error)) {
				Window.confirm!({ message: (error as Error).message }, [{ label: get('yes') }]);
			}
		} finally {
			this._cancels.delete(key);
			this._speedMarks.delete(key);
		}
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
		this.mergeRows();
	}

	async open() {
		Window.open!('resource');
		this.load();
		void this.refreshRemote();
	}
})();
