import { YamiIpc } from '@app/services/ipc/bridge.ts';
import { moduleEls } from '@app/module/element-registry';
import { titleEls } from '@app/title/element-registry';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { enable } from '@app/utils/element-utils.ts';
import { Path } from '@app/utils/config';
import { Editor } from '@app/services/project/editor.ts';
import { TemplatesPath } from './global.ts';
import type { YamiElement } from '@app/types/element-api';

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
		YamiIpc.events.on(CHANNELS.send.apkLog, (_: unknown, log: unknown) => {
			this.logs.push(log as ApkLogEntry);
			this.apkLog!(log as ApkLogEntry);
		});
	}
	build(cfg: ApkConfig) {
		this.logs.length = 0;
		this.notifyLogContent();
		const config = this.process!(cfg);
		void YamiIpc.invoke.buildApk(config);
	}
	notifyLogContent() {
		(
			moduleEls.get('export-apk-content') as unknown as HTMLElement & { update?: () => void }
		).update?.();
	}
	apkLog(log: ApkLogEntry) {
		this.notifyLogContent();
		if (log.done) {
			enable(titleEls.get('export-apk-button') as YamiElement);
		}
	}
	reset() {
		this.logs.length = 0;
		this.notifyLogContent();
		enable(titleEls.get('export-apk-button') as YamiElement);
	}
	clearLog() {
		this.logs = [];
	}
	stopBuild() {
		void YamiIpc.invoke.stopBuildApk().then(() => {
			this.reset!();
		});
	}
	isBuilding() {
		return YamiIpc.sync.isBuildingApk();
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
		return config;
	}
})();
