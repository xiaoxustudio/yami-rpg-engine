#!/usr/bin/env node
// 将 electron-builder 产出的播放器壳子复制到编辑器 Project/Templates，
// 供编辑器部署/资源打包流程消费。仅复制实际存在的平台产物。
const fs = require('fs');
const path = require('path');

const pkgRoot = path.resolve(__dirname, '..');
const editorTemplates = path.resolve(pkgRoot, '../editor/Project/Templates');

const targets = [
	{
		from: path.resolve(pkgRoot, 'dist/win-unpacked'),
		to: path.resolve(editorTemplates, 'electron-win-x64')
	},
	{
		from: path.resolve(pkgRoot, 'dist/mac-universal'),
		to: path.resolve(editorTemplates, 'electron-mac-universal.app')
	}
];

function copyDir(src, dest) {
	fs.mkdirSync(dest, { recursive: true });
	for (const name of fs.readdirSync(src)) {
		const srcPath = path.join(src, name);
		const destPath = path.join(dest, name);
		if (fs.statSync(srcPath).isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.mkdirSync(path.dirname(destPath), { recursive: true });
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

for (const target of targets) {
	if (!fs.existsSync(target.from)) {
		console.log(`skip (not built): ${target.from}`);
		continue;
	}
	// mac-universal 目录下是 <productName>.app
	let source = target.from;
	if (path.basename(target.from) === 'mac-universal') {
		const appDir = fs.readdirSync(target.from).find((v) => v.endsWith('.app'));
		if (appDir) source = path.join(target.from, appDir);
	}
	fs.rmSync(target.to, { recursive: true, force: true });
	copyDir(source, target.to);
	console.log(`installed: ${source} -> ${target.to}`);
}
