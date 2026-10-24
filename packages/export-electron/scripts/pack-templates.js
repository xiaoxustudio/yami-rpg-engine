const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ZipArchive } = require('archiver');

const pkgRoot = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
const only = process.argv.find((arg) => arg.startsWith('--platform='))?.split('=')[1];
const outDir = path.join(pkgRoot, 'build');

const targets = [
	{ platform: 'win-x64', source: path.join(pkgRoot, 'dist/win-unpacked') },
	{ platform: 'mac-universal', source: path.join(pkgRoot, 'dist/mac-universal') }
].filter((target) => !only || target.platform === only);

function zipFolder(src, out) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(src)) {
			reject(new Error(`源目录不存在: ${src}`));
			return;
		}
		fs.mkdirSync(path.dirname(out), { recursive: true });
		const output = fs.createWriteStream(out);
		const archive = new ZipArchive({ zlib: { level: 9 } });
		output.on('close', resolve);
		archive.on('error', reject);
		archive.pipe(output);
		archive.directory(src, false);
		void archive.finalize();
	});
}

function sha256(file) {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash('sha256');
		const stream = fs.createReadStream(file);
		stream.on('data', (chunk) => hash.update(chunk));
		stream.on('end', () => resolve(hash.digest('hex')));
		stream.on('error', reject);
	});
}

void (async () => {
	fs.mkdirSync(outDir, { recursive: true });
	let packed = 0;
	for (const target of targets) {
		if (!fs.existsSync(target.source)) {
			console.log(`skip (not built): ${target.source}`);
			continue;
		}
		// oxlint-disable-next-line no-await-in-loop
		const zipName = `electron-${target.platform}_${pkg.version}.zip`;
		// oxlint-disable-next-line no-await-in-loop
		await zipFolder(target.source, path.join(outDir, zipName));
		// oxlint-disable-next-line no-await-in-loop
		const hash = await sha256(path.join(outDir, zipName));
		const manifest = {
			name: `electron-${target.platform}`,
			version: pkg.version,
			electronVersion: pkg.yami?.electronVersion ?? '',
			minEditorVersion: pkg.yami?.minEditorVersion ?? '',
			platform: target.platform,
			file: zipName,
			sha256: hash
		};
		fs.writeFileSync(
			path.join(outDir, `manifest-${target.platform}.json`),
			`${JSON.stringify(manifest, null, 2)}\n`
		);
		console.log(`packed: ${zipName} ${hash}`);
		packed++;
	}
	if (packed === 0) {
		console.error('没有可打包的导出模板，请先运行 build:template / build:template:mac');
		process.exit(1);
	}
})();
