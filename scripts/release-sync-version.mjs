#!/usr/bin/env node
// 发布流程用：把 tag 的 semver 写进 `packages/editor/package.json`。
//
// 为什么需要：`packages/editor/package.json` 的 `version` 是编辑器版本的**唯一真源** ——
//   · electron-builder 用它命名安装包；
//   · `src/services/updater/updater.ts` 从它派生 `latestEditorVersion`；
//   · 该值再被写进用户 `config.json`（迁移纪元）与 `src/module/packmeta.json` 的 `Editor`，
//     并显示在首页"当前编辑器版本"。
// 发布时把 tag 的 semver 写进来，上述各处就一起对齐；否则安装包会一直叫 `… 1.0.18.exe`。
// 守卫：`packages/editor/src/services/updater/__tests__/version.spec.ts` 会从磁盘独立读
// package.json 并断言 `latestEditorVersion` 与它相等，防止有人把字面量写回去。
//
// 只在 CI 的工作区里改，**不提交**；因此这里刻意不做 git 干净度校验。
// 单独成脚本而不是塞进 workflow 的 `node -e`：内联写法要跨 shell 处理引号，
// 而本地 PowerShell 会把双引号吃掉，导致脚本静默失败（实测踩过）。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = join(repoRoot, 'packages', 'editor', 'package.json');

const version = process.argv[2];
if (!version) {
	console.error('用法: node scripts/release-sync-version.mjs <semver>');
	process.exit(1);
}
if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
	console.error(`不是合法 semver：${version}`);
	process.exit(1);
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const previous = pkg.version;
pkg.version = version;
// 用 tab 缩进以贴合仓库既有排版（JSON.stringify 默认 2 空格会把整个文件重排）
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, '\t')}\n`);

console.log(`packages/editor version: ${previous} → ${version}`);
