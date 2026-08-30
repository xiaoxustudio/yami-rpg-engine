import Path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import fsExtra from 'fs-extra';
import nodeYauzl from 'yauzl';
import { $ } from '@app/utils/dom';
import { Resources } from './resource.ts';
import { SettingConfig } from '@app/services/project/setting-config';
import { Updater } from '@app/services/updater/updater.ts';
import OriginPackmeta from './packmeta.json';

const GlobalPath =
	typeof Path.resolve === 'function' ? Path.resolve(os.homedir?.() ?? '', '.openyami') : '';
const moduleUrl = new URL(import.meta.url);
const moduleDir = moduleUrl.protocol === 'file:' ? Path.dirname(fileURLToPath(moduleUrl)) : './';

const fs = fsExtra;
const yauzl = nodeYauzl;

export { yauzl, fs, GlobalPath };

export const CommunityVersion = '26072501';

const packmetaPath = () => {
	return Path.join(moduleDir, 'packmeta.json');
};

export let PackMeta: Record<string, string> = OriginPackmeta;
export const TemplatesPath =
	typeof Path.resolve === 'function' ? Path.resolve(GlobalPath, 'Templates') : '';
if (typeof fs.existsSync === 'function' && !fs.existsSync(TemplatesPath))
	fs.mkdirSync(TemplatesPath, { recursive: true });

export function isNoResource() {
	const bak = JSON.parse(JSON.stringify(PackMeta));
	delete bak['Editor'];
	delete bak['Project'];
	delete bak['Community'];
	const p = {} as Record<string, { check: boolean }> & { '@': boolean };
	Object.defineProperty(p, '@', {
		value: false,
		enumerable: false,
		writable: true
	});
	try {
		const checkArr: boolean[] = [];
		Object.keys(bak).map((v) => {
			p[v] ??= {} as { check: boolean };
			p[v]['check'] = false;
			const _path = Path.resolve(TemplatesPath, v) ?? '';
			if (fs.existsSync(_path)) {
				p[v]['check'] = true;
				checkArr.push(true);
			} else {
				checkArr.push(false);
			}
		});
		if (checkArr.every((v) => v)) p['@'] = true;
		return p;
	} catch {
		return p;
	}
}

export let NoResourceObj = isNoResource();

export function setPackMeta(value: Record<string, string>) {
	PackMeta = value;
}
export function setNoResourceObj(value: Record<string, { check: boolean }> & { '@': boolean }) {
	NoResourceObj = value;
}

window.addEventListener('localize', () => {
	void Resources.initialize();
	if (!NoResourceObj['arpg-ts-english']?.check && !NoResourceObj['arpg-ts-chinese']?.check) {
		void Resources.open();
		void Resources.checkEditorVersion();
	}
	if (SettingConfig.config?.update?.checkOnStart !== false) {
		void Resources.checkVersion();
		void Resources.checkEditorVersion();
	}
	Resources.loaded = true;
});

export let homeElem: HTMLElement | null = null;

window.addEventListener(
	'vue-app-mounted',
	() => {
		homeElem = $('#home-version');
		if (homeElem) {
			homeElem.textContent = `当前社区版本：${CommunityVersion} 当前编辑器版本：${Updater.latestEditorVersion} 
当前项目版本：${Updater.latestProjectVersion}`;
		}
	},
	{ once: true }
);
(() => {
	PackMeta['Editor'] = Updater.latestEditorVersion;
	PackMeta['Project'] = Updater.latestProjectVersion;
	PackMeta['Community'] = CommunityVersion;
	fs.writeFileSync(packmetaPath(), JSON.stringify(PackMeta));
})();
