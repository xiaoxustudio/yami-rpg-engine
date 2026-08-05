const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LEGACY_DIR = path.join(ROOT, 'src', 'legacy');
const MODULE_INIT = path.join(LEGACY_DIR, 'main', 'module-init.ts');

// 白名单：调用方直接 import 的功能模块，无需在 module-init 中副作用全量加载。
// 新增 legacy 模块必须加入 module-init.ts；确属此类模块时在此声明理由。
const EXCLUDE = [
	// types/：纯类型声明，仅被 import type 引用
	'types/animation-player.ts',
	'types/editor-event.ts',
	'types/file-browser-links.ts',
	'types/history.ts',
	'types/list-interface.ts',
	'types/marquee-area.ts',
	'types/tree-data.ts',
	// util/：工具函数/惰性单例，Vue 组件与 store 直接 import
	'util/element-utils.ts',
	'util/doubleclick.ts',
	'util/monaco.ts',
	'util/icon-clip.ts',
	// components/：Wave2 迁移工厂（attachXxxApi），被对应 Vue SFC import
	'components/check-box.ts',
	'components/color-box.ts',
	'components/command-list.ts',
	'components/common-list.ts',
	'components/custom-box.ts',
	'components/custom-box-opts.ts',
	'components/drag-and-drop-hint.ts',
	'components/file-var.ts',
	'components/keyboard-box.ts',
	'components/menu-list.ts',
	'components/number-box.ts',
	'components/number-var.ts',
	'components/radio-box.ts',
	'components/radio-proxy.ts',
	'components/select-box.ts',
	'components/select-list.ts',
	'components/select-var.ts',
	'components/slider-box.ts',
	'components/string-var.ts',
	'components/text-area.ts',
	'components/text-box.ts',
	'components/textarea-var.ts',
	'components/tree-list.ts',
	// browser/：被 src/main.ts side-effect import
	'browser/browser-bridge.ts',
	// command/：被 CustomBox.vue import
	'command/preset-accessor-factory.ts',
	// tools/：被 local-window/variable/enum-window/attribute-window import
	'tools/list-clipboard-methods.ts',
	// module/settingconfig/：barrel + 内部实现，被 global/resource/open/home-page 等 import
	'module/settingconfig/index.ts',
	'module/settingconfig/renderer.ts',
	'module/settingconfig/schema.ts',
	'module/settingconfig/types.ts'
];

const EXCLUDE_SET = new Set(EXCLUDE);

function walk(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(full, out);
		} else if (entry.isFile() && entry.name.endsWith('.ts')) {
			out.push(full);
		}
	}
	return out;
}

const rel = (p) => path.relative(LEGACY_DIR, p).replace(/\\/g, '/');
const resolveImport = (fromDir, spec) => {
	let target = path.resolve(fromDir, spec);
	if (!target.endsWith('.ts')) target += '.ts';
	return target;
};

function main() {
	if (!fs.existsSync(MODULE_INIT)) {
		console.error(`check-module-init: 未找到 ${MODULE_INIT}`);
		process.exit(1);
	}

	const content = fs.readFileSync(MODULE_INIT, 'utf8');
	const mainDir = path.dirname(MODULE_INIT);
	const imported = new Set();
	const importErrors = [];
	for (const m of content.matchAll(/^import\s+['"]([^'"]+)['"]/gm)) {
		const spec = m[1];
		const target = resolveImport(mainDir, spec);
		if (!fs.existsSync(target)) {
			importErrors.push(`${rel(target)}（import '${spec}' 指向的文件不存在）`);
			continue;
		}
		imported.add(rel(target));
	}

	const onDisk = new Set(walk(LEGACY_DIR).map((p) => rel(p)));
	onDisk.delete('main/module-init.ts');

	const missing = [];
	for (const file of [...onDisk].sort()) {
		if (!imported.has(file) && !EXCLUDE_SET.has(file)) {
			missing.push(file);
		}
	}

	const stale = EXCLUDE.filter((f) => !onDisk.has(f));

	const errors = [...importErrors, ...missing];
	if (errors.length > 0) {
		console.error('check-module-init: FAILED');
		for (const e of errors) console.error(`  MISSING import: ${e}`);
		for (const s of stale)
			console.warn(`  WARN EXCLUDE 过期（文件已删除，建议清理白名单）: ${s}`);
		process.exit(1);
	}

	console.log(`check-module-init: OK（${imported.size} 个模块，白名单 ${EXCLUDE.length} 个）`);
	if (stale.length > 0) {
		for (const s of stale)
			console.warn(`  WARN EXCLUDE 过期（文件已删除，建议清理白名单）: ${s}`);
	}
}

main();
