import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const readJson = (root, relative) => JSON.parse(readFileSync(join(root, relative), 'utf8'));
const readVersion = (root, relative) => readJson(root, relative).version;

export function validateResourcesLock(root = process.cwd()) {
	const lock = readJson(root, 'resources.lock.json');
	const errors = [];
	const check = (label, actual, expected) => {
		if (actual !== expected) errors.push(`${label}: 锁文件 ${expected}，实际 ${actual}`);
	};

	check('editor', readVersion(root, 'packages/editor/package.json'), lock.editor);
	check('uiKit', readVersion(root, 'packages/ui-kit/package.json'), lock.uiKit);
	check('script', readVersion(root, 'packages/script/package.json'), lock.script);
	check(
		'exportElectron',
		readVersion(root, 'packages/export-electron/package.json'),
		lock.exportElectron
	);
	const exportPkg = readJson(root, 'packages/export-electron/package.json');
	check('electronVersion', exportPkg.yami?.electronVersion ?? '', lock.electronVersion);

	const templateVersion = readVersion(root, 'packages/template-arpg/package.json');
	for (const [name, version] of Object.entries(lock.templates)) {
		check(`template:${name}`, templateVersion, version);
	}

	const updater = readFileSync(
		join(root, 'packages/editor/src/services/updater/updater.ts'),
		'utf8'
	);
	const projectVersion = updater.match(/latestProjectVersion:\s*'([^']+)'/)?.[1];
	if (projectVersion) check('projectVersion', projectVersion, lock.projectVersion);

	if (errors.length > 0) {
		throw new Error(`resources.lock.json 与 workspace 不一致：\n- ${errors.join('\n- ')}`);
	}
	return lock;
}

const isDirectRun =
	process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectRun) {
	const lock = validateResourcesLock();
	console.log(`resources lock OK: editor ${lock.editor}`);
}
