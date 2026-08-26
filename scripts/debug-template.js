#!/usr/bin/env node
// 调试 template-arpg + export-electron：
//   组装模板（快，不打 zip）→ tsc 编译 Dist → 用 YAMI_PLAYER_DIR 启动 player dev（自动开 DevTools）
// 用法：node scripts/debug-template.js [--lang=zh-CN|en-US] [--watch] [--inspect] [--player-only]
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const langArg = args.find((a) => a.startsWith('--lang='));
const lang = langArg ? langArg.split('=')[1] : 'zh-CN';
const watch = args.includes('--watch');
const inspect = args.includes('--inspect');
const playerOnly = args.includes('--player-only');

const templateRoot = path.join(repoRoot, 'packages/template-arpg');
const languages = JSON.parse(
	fs.readFileSync(path.join(templateRoot, 'languages.json'), 'utf8')
).languages;
const target = languages.find((l) => l.id === lang);
if (!target) {
	console.error(`unknown language: ${lang}`);
	process.exit(1);
}
const assembleDir = path.join(templateRoot, 'out', target.resource);

function runSync(cmd, cmdArgs, env) {
	const result = spawnSync(cmd, cmdArgs, {
		cwd: repoRoot,
		stdio: 'inherit',
		env: { ...process.env, ...env },
		shell: process.platform === 'win32'
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
}

// 1) 组装 + 编译
if (!playerOnly) {
	const devAssemble = path.join(templateRoot, 'scripts/dev-assemble.js');
	console.log(`[debug-template] assemble + compile: ${target.resource}`);
	runSync(process.execPath, [devAssemble, `--lang=${target.id}`, '--compile']);
} else {
	if (!fs.existsSync(path.join(assembleDir, 'index.html'))) {
		console.error(`not assembled yet: ${assembleDir}，请先去掉 --player-only 运行一次`);
		process.exit(1);
	}
}

// 2) 监听模式：后台重组装 + 重编译（player 里 DevTools 手动刷新）
let watcher = null;
if (watch) {
	const devAssemble = path.join(templateRoot, 'scripts/dev-assemble.js');
	console.log(`[debug-template] watching template content...`);
	watcher = spawn(
		process.execPath,
		[devAssemble, `--lang=${target.id}`, '--watch', '--compile'],
		{ cwd: repoRoot, stdio: 'inherit' }
	);
}

// 3) 启动 player dev
console.log(`[debug-template] launch player dev: ${assembleDir}`);
const player = spawn('pnpm', ['-F', '@yami/export-electron', inspect ? 'dev:inspect' : 'dev'], {
	cwd: repoRoot,
	stdio: 'inherit',
	env: { ...process.env, YAMI_PLAYER_DIR: assembleDir },
	shell: process.platform === 'win32'
});
player.on('close', (code) => {
	if (watcher) watcher.kill();
	process.exit(code ?? 0);
});
