#!/usr/bin/env node
// 资源包聚合：构建 template-arpg（多语言）+ script 模板 + Project/Apk + electron 壳 → 仓库根 pack.json
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const editorRoot = path.join(repoRoot, 'packages/editor');
const outPack = path.join(repoRoot, 'pack.json');

const extraDirs = [
	{ sourceDir: path.join(editorRoot, 'Project/Apk'), name: 'Apk', version: '' },
	{
		sourceDir: path.join(editorRoot, 'Project/Templates/electron-win-x64'),
		name: 'electron-win-x64',
		version: electronVersion()
	},
	{
		sourceDir: path.join(editorRoot, 'Project/Templates/electron-mac-universal.app'),
		name: 'electron-mac-universal.app',
		version: electronVersion()
	}
];

function electronVersion() {
	const pkg = path.join(repoRoot, 'packages/export-electron/package.json');
	if (!fs.existsSync(pkg)) return '';
	return JSON.parse(fs.readFileSync(pkg, 'utf8')).version || '';
}

function hashFile(filePath, algorithms) {
	return new Promise((resolve, reject) => {
		const hashes = {};
		const hashers = algorithms.map((algo) => {
			hashes[algo] = crypto.createHash(algo);
			return hashes[algo];
		});
		const stream = fs.createReadStream(filePath);
		stream.on('data', (chunk) => {
			for (const hasher of hashers) hasher.update(chunk);
		});
		stream.on('end', () => {
			for (let i = 0; i < algorithms.length; i++) {
				hashes[algorithms[i]] = hashers[i].digest('hex');
			}
			resolve(hashes);
		});
		stream.on('error', reject);
	});
}

function zipFolder(src, out) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(src)) {
			return reject(new Error(`源目录不存在: ${src}`));
		}
		fs.mkdirSync(path.dirname(out), { recursive: true });
		const output = fs.createWriteStream(out);
		const archive = archiver('zip', { zlib: { level: 9 } });
		output.on('close', resolve);
		archive.on('error', reject);
		archive.pipe(output);
		archive.directory(src, false);
		archive.finalize();
	});
}

async function packDir(sourceDir, name, version) {
	const zipPath = path.join(repoRoot, 'build', `${name}_pack.zip`);
	await zipFolder(sourceDir, zipPath);
	const hashes = await hashFile(zipPath, ['md5', 'sha1', 'sha256']);
	return { path: name, realPath: sourceDir, version, ...hashes };
}

void (async () => {
	const entries = [];

	// 1) template-arpg 多语言模板：vite 驱动构建产出各语言 *_pack.json
	const templateRoot = path.join(repoRoot, 'packages/template-arpg');
	console.log('build template-arpg (all languages)');
	execFileSync('pnpm', ['-F', '@yami/template-arpg', 'build:all'], {
		cwd: repoRoot,
		stdio: 'inherit',
		shell: true
	});
	const buildDir = path.join(templateRoot, 'build');
	for (const file of fs.readdirSync(buildDir)) {
		if (file.endsWith('_pack.json')) {
			entries.push(JSON.parse(fs.readFileSync(path.join(buildDir, file), 'utf8')));
		}
	}

	// 2) script 脚本骨架模板
	const scriptRoot = path.join(repoRoot, 'packages/script');
	console.log('pack template: script');
	execFileSync(process.execPath, [path.join(scriptRoot, 'scripts/pack.js')], {
		cwd: scriptRoot,
		stdio: 'inherit'
	});
	entries.push(
		JSON.parse(fs.readFileSync(path.join(scriptRoot, 'build/script_pack.json'), 'utf8'))
	);

	// 3) Apk + electron 壳
	for (const extra of extraDirs) {
		if (!fs.existsSync(extra.sourceDir)) {
			console.log(`skip (not exists): ${extra.sourceDir}`);
			continue;
		}
		console.log(`pack extra: ${extra.name}`);
		// oxlint-disable-next-line no-await-in-loop
		const entry = await packDir(extra.sourceDir, extra.name, extra.version);
		entries.push(entry);
	}

	fs.writeFileSync(outPack, JSON.stringify(entries, null, 2));
	console.log(`pack.json written: ${outPack} (${entries.length} entries)`);
})();
