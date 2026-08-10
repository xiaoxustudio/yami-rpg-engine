import { ipcRenderer } from 'electron';
import { $ } from '@/util/dom.ts';
import { addClass, clear, enable } from '@/util/element-utils.ts';
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
		ipcRenderer?.on?.('apk-log', (_: unknown, log: ApkLogEntry) => {
			this.logs.push(log);
			this.apkLog!(log);
		});
	}
	build(cfg: ApkConfig) {
		clear($('#export-apk-content'));
		const config = this.process!(cfg);
		ipcRenderer.invoke('build-apk', config);
	}
	apkLog(log: ApkLogEntry) {
		const text = document.createElement('div');
		text.textContent = log.msg;
		addClass(text, 'export-apk-major');
		addClass(text, 'text');
		$('#export-apk-content').appendChild(text);
		if (log.done) {
			enable($('#export-apk-button'));
		}
		$('#export-apk-container').scrollTo({
			top: $('#export-apk-container').scrollHeight
		});
	}
	reset() {
		clear($('#export-apk-content'));
		enable($('#export-apk-button'));
	}
	clearLog() {
		this.logs = [];
	}
	stopBuild() {
		ipcRenderer.invoke('stop-build-apk').then(() => {
			this.reset!();
		});
	}
	isBuilding() {
		return ipcRenderer.sendSync('isBuilding-apk');
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
