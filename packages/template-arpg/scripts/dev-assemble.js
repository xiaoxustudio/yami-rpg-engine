#!/usr/bin/env node
// 快速组装模板（runtime + 语言覆盖 → out/<resource>，不打 zip）
// 用法：node scripts/dev-assemble.js [--lang=zh-CN] [--watch] [--compile]
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const langArg = args.find((a) => a.startsWith('--lang='));
const lang = langArg ? langArg.split('=')[1] : 'zh-CN';
const watch = args.includes('--watch');
const compile = args.includes('--compile');

const languages = JSON.parse(fs.readFileSync(path.join(ROOT, 'languages.json'), 'utf8')).languages;
const target = languages.find((l) => l.id === lang);
if (!target) {
	console.error(`unknown language: ${lang}`);
	process.exit(1);
}

const assembleDir = path.join(ROOT, 'out', target.resource);
const watchDirs = [path.join(ROOT, 'runtime'), path.join(ROOT, 'languages', target.id)];

function resolveViteBin() {
	try {
		const pkgMain = require.resolve('vite', { paths: [ROOT] });
		const viteRoot = path.resolve(pkgMain, '../../..');
		const bin = path.join(viteRoot, 'bin', 'vite.js');
		return fs.existsSync(bin) ? bin : undefined;
	} catch {
		return undefined;
	}
}

function resolveTsc() {
	const candidates = [path.resolve(__dirname, '../../editor/node_modules/typescript/bin/tsc')];
	return candidates.find((c) => fs.existsSync(c));
}

function runAssemble() {
	const viteBin = resolveViteBin();
	if (!viteBin) {
		console.error('vite not found');
		return false;
	}
	const result = spawnSync(process.execPath, [viteBin, 'build', '--mode', target.id], {
		cwd: ROOT,
		stdio: 'inherit',
		env: { ...process.env, YAMI_DEV_ASSEMBLE: '1' }
	});
	if (result.status !== 0) return false;

	if (compile) {
		const tsc = resolveTsc();
		if (tsc) {
			const tsResult = spawnSync(
				process.execPath,
				[tsc, '-p', path.join(assembleDir, 'tsconfig.json')],
				{ stdio: 'inherit' }
			);
			if (tsResult.status !== 0) return false;
		} else {
			console.warn('typescript not found, skip compile');
		}
	}
	return true;
}

if (!runAssemble()) {
	process.exit(1);
}

if (watch) {
	let timer = null;
	let busy = false;
	const schedule = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (busy) {
				schedule();
				return;
			}
			busy = true;
			runAssemble();
			busy = false;
		}, 300);
	};
	for (const dir of watchDirs) {
		if (!fs.existsSync(dir)) continue;
		fs.watch(dir, { recursive: true }, schedule);
	}
	console.log(`watching: ${watchDirs.join(', ')}`);
}
