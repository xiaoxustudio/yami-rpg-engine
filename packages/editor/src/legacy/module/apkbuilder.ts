import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { $ } from '@/util/dom.ts';
import { enable } from '@/util/element-utils.ts';
import { Path } from '@/util/config.ts';
import { Editor } from '@/main/editor.ts';
import { TemplatesPath } from './global.ts';

interface ApkConfig {
	[k: string]: unknown;
}

interface ApkLogEntry {
	done: boolean;
	msg: string;
}

export const ApkBuilder = new (class {
	logs: ApkLogEntry[] = [];
	constructor() {
		ipcRenderer?.on?.(CHANNELS.send.apkLog, (_: unknown, log: ApkLogEntry) => {
			this.logs.push(log);
			this.apkLog!(log);
		});
	}
	build(cfg: ApkConfig) {
		this.logs.length = 0;
		this.notifyLogContent();
		const config = this.process!(cfg);
		ipcRenderer.invoke(CHANNELS.invoke.buildApk, config);
	}
	notifyLogContent() {
		($('#export-apk-content') as HTMLElement & { update?: () => void }).update?.();
	}
	apkLog(log: ApkLogEntry) {
		this.notifyLogContent();
		if (log.done) {
			enable($('#export-apk-button'));
		}
	}
	reset() {
		this.logs.length = 0;
		this.notifyLogContent();
		enable($('#export-apk-button'));
	}
	clearLog() {
		this.logs = [];
	}
	stopBuild() {
		ipcRenderer.invoke(CHANNELS.invoke.stopBuildApk).then(() => {
			this.reset!();
		});
	}
	isBuilding() {
		return ipcRenderer.sendSync(CHANNELS.on.isBuildingApk);
	}
	processPathOnly(line: string) {
		const pathPrefix = Path.resolve!(Path.dirname!(Editor.config!.project!), 'apk');
		if (typeof line === 'string' && line?.startsWith('@')) {
			return Path.resolve!(TemplatesPath, 'Apk', line.replace('@', '.'));
		} else if (typeof line === 'string' && line?.startsWith('$')) {
			return Path.resolve!(pathPrefix, line.replace('$', '.'));
		} else if (typeof line === 'string' && line?.startsWith('~')) {
			return Path.resolve!(Path.dirname!(Editor.config!.project!), line.replace('~', '.'));
		}
		return line;
	}
	process(cfg: ApkConfig) {
		const config = JSON.parse(JSON.stringify(cfg));
		const list = Object.keys(config);
		list.forEach((v: string) => {
			config[v] = this.processPathOnly!(config[v]);
		});
		config.projectPath = Path.dirname!(Editor.config!.project!);
		console.log(config);
		return config;
	}
})();
