import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import type { Plugin } from 'vite';

const copyDirRecursive = (src: string, dest: string) => {
	if (!existsSync(src)) return;
	mkdirSync(dest, { recursive: true });
	for (const name of readdirSync(src)) {
		const srcPath = join(src, name);
		const destPath = join(dest, name);
		if (statSync(srcPath).isDirectory()) {
			copyDirRecursive(srcPath, destPath);
		} else {
			copyFileSync(srcPath, destPath);
		}
	}
};

// 将 Project/ 下需原样输出的静态资源复制到 dist/
const copyStaticAssetsToDist = (projectRoot: string, outDir: string) => {
	const root = resolve(projectRoot, 'Project');
	const staticDirs = ['Locales', 'Fonts', 'Images', 'Apk'];
	const staticFiles: Array<[string, string]> = [
		['default.json', 'default.json'],
		['commands.json', 'commands.json'],
		// packmeta 运行时由 global.ts 以 __dirname/Script/module/packmeta.json 读取，dest 保持原路径；源文件已随 src/ 迁移至项目根
		['../src/module/packmeta.json', 'Script/module/packmeta.json']
	];
	// 创建module目录
	mkdirSync(join(outDir, 'Script/module'), { recursive: true });
	for (const dir of staticDirs) {
		copyDirRecursive(join(root, dir), join(outDir, dir));
	}
	for (const [file, dest] of staticFiles) {
		const src = join(root, file);
		if (existsSync(src)) copyFileSync(src, join(outDir, dest));
	}
};

export function copyStaticAssets(projectRoot: string): Plugin {
	return {
		name: 'copy-static-assets',
		closeBundle() {
			copyStaticAssetsToDist(projectRoot, resolve(projectRoot, 'dist'));
		}
	};
}
