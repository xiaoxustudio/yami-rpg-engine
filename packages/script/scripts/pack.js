#!/usr/bin/env node
// 打包本模板：zip template/ → build/<name>_pack.zip + 哈希，输出 build/<name>_pack.json
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');

const pkgRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
const name = manifest.name.replace(/^@[^/]+\//, '');
const sourceDir = path.join(pkgRoot, 'template');
const outDir = path.join(pkgRoot, 'build');
const zipPath = path.join(outDir, `${name}_pack.zip`);

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

void (async () => {
	await zipFolder(sourceDir, zipPath);
	const hashes = await hashFile(zipPath, ['md5', 'sha1', 'sha256']);
	const entry = { path: name, realPath: sourceDir, version: manifest.version, ...hashes };
	fs.writeFileSync(path.join(outDir, `${name}_pack.json`), JSON.stringify(entry, null, 2));
	console.log(`packed: ${zipPath} v${manifest.version}`);
})();
