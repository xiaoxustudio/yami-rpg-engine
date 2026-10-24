import { defineConfig, type Plugin, type UserConfig, type ConfigEnv } from 'vite';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import fs from 'fs';
import crypto from 'crypto';
import archiver from 'archiver';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const languages = (
	JSON.parse(fs.readFileSync(resolve(ROOT, 'languages.json'), 'utf8')) as {
		languages: Array<{ id: string; resource: string }>;
	}
).languages;

function copyDirRecursive(src: string, dest: string): void {
	if (!fs.existsSync(src)) return;
	fs.mkdirSync(dest, { recursive: true });
	for (const name of fs.readdirSync(src)) {
		const srcPath = resolve(src, name);
		const destPath = resolve(dest, name);
		if (fs.statSync(srcPath).isDirectory()) {
			copyDirRecursive(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function hashFile(filePath: string, algorithms: string[]): Promise<Record<string, string>> {
	return new Promise((resolvePromise, reject) => {
		const hashes: Record<string, crypto.Hash> = {};
		const hashers = algorithms.map((algo) => {
			hashes[algo] = crypto.createHash(algo);
			return hashes[algo];
		});
		const stream = fs.createReadStream(filePath);
		stream.on('data', (chunk: string | Buffer) => {
			for (const hasher of hashers) hasher.update(chunk);
		});
		stream.on('end', () => {
			const out: Record<string, string> = {};
			for (let i = 0; i < algorithms.length; i++) {
				out[algorithms[i]] = hashers[i].digest('hex');
			}
			resolvePromise(out);
		});
		stream.on('error', reject);
	});
}

function zipFolder(src: string, out: string): Promise<void> {
	return new Promise((resolvePromise, reject) => {
		if (!fs.existsSync(src)) {
			return reject(new Error(`源目录不存在: ${src}`));
		}
		fs.mkdirSync(resolve(out, '..'), { recursive: true });
		const output = fs.createWriteStream(out);
		const archive = archiver('zip', { zlib: { level: 9 } });
		output.on('close', resolvePromise);
		archive.on('error', reject);
		archive.pipe(output);
		archive.directory(src, false);
		void archive.finalize();
	});
}

function assembleAndPackPlugin(): Plugin {
	let lang = '';
	return {
		name: 'template-arpg',
		config(_config: UserConfig, env: ConfigEnv) {
			lang = env.mode;
			return {
				build: {
					outDir: resolve(ROOT, 'out'),
					write: false,
					emptyOutDir: false,
					minify: false,
					lib: {
						entry: resolve(ROOT, 'src/main.ts'),
						formats: ['es'],
						fileName: () => 'main.js'
					}
				}
			};
		},
		async closeBundle() {
			const target = languages.find((l) => l.id === lang);
			if (!target) {
				throw new Error(`unknown language mode: ${lang}`);
			}
			const assembleDir = resolve(ROOT, `out/${target.resource}`);
			fs.rmSync(assembleDir, { recursive: true, force: true });
			copyDirRecursive(resolve(ROOT, 'runtime'), assembleDir);
			copyDirRecursive(resolve(ROOT, `languages/${target.id}`), assembleDir);
			console.log(`assembled: ${target.resource} -> ${assembleDir}`);

			// YAMI_DEV_ASSEMBLE=1：仅组装（调试用，跳过 zip/哈希，速度快）
			if (process.env.YAMI_DEV_ASSEMBLE === '1') return;

			const zipPath = resolve(ROOT, `build/${target.resource}_pack.zip`);
			await zipFolder(assembleDir, zipPath);
			const hashes = await hashFile(zipPath, ['md5', 'sha1', 'sha256']);
			const entry = {
				path: target.resource,
				realPath: assembleDir,
				version: pkg.version,
				minEditorVersion: pkg.yami?.minEditorVersion ?? '',
				projectVersion: pkg.yami?.projectVersion ?? '',
				...hashes
			};
			fs.writeFileSync(
				resolve(ROOT, `build/${target.resource}_pack.json`),
				JSON.stringify(entry, null, 2)
			);
			console.log(`packed: ${target.resource} v${pkg.version}`);
		}
	};
}

export default defineConfig({
	plugins: [assembleAndPackPlugin()]
});
