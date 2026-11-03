#!/usr/bin/env node
/**
 * 一次性 codemod：给命令窗口补上「控件级能力桥」的窗口侧接线。
 *
 * 做四件事（每个窗口一次）：
 *   ① 生成/覆盖 `composables/<kebab>-bridge.ts`（`loadItems` 一种能力，按需多参数）；
 *   ② 窗口 import 桥的三件套 + `onUnmounted`；
 *   ③ 窗口里插 `bridgeApi`（把能力转成本窗口控件的 `loadItems`）；
 *   ④ 在 `onMounted` 首行 provide + 注册卸载注销。
 *
 * 用法：
 *   node scripts/oneoff/wire-command-bridges.mjs <窗口名> <bridgeId> <方法名> <控件 id…> [--apply]
 *   例：node scripts/oneoff/wire-command-bridges.mjs GetActor getActor loadItems getActor-attribute getActor-divisor
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'packages/editor/src';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const APPLY = process.argv.includes('--apply');
const [windowName, bridgeId, method, ...controlIds] = args;
if (!windowName || !bridgeId || !method || controlIds.length === 0) {
	console.error(
		'用法：wire-command-bridges.mjs <窗口名> <bridgeId> <方法名> <控件 id…> [--apply]'
	);
	process.exit(1);
}

const kebab = bridgeId.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const Pascal = `${bridgeId.charAt(0).toUpperCase()}${bridgeId.slice(1)}`;
const iface = `${Pascal}Bridge`;
const provide = `provide${iface}`;
const reset = `reset${iface}`;
const getter = `get${iface}`;

const bridgeFile = `${ROOT}/composables/${kebab}-bridge.ts`;
const windowFile = `${ROOT}/components/commands/${windowName}.vue`;

const bridgeSource = `/**
 * ${bridgeId} 窗口的**控件级能力桥**（模块级强类型）。
 *
 * 命令 schema 载入表单时要给窗口里的下拉灌候选项。旧做法是按 id 从 \`composableEls\` 取元素再调
 * \`loadItems\`；窗口迁成模板 ref 后控件不再进注册表，于是这个能力由窗口实现、经模块桥交出 ——
 * schema 不再知道控件 id。
 *
 * 实现收口在 \`composables/form-bridge.ts\`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface ${iface} {
	/** 灌入候选项（一次给全部下拉）。 */
	${method}(items: unknown[]): void;
}

const bridge = createFormBridge<${iface}>('${bridgeId}');

/** 组件挂载时登记。 */
export const ${provide} = (api: ${iface}): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const ${reset} = (api: ${iface}): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null（等价于原来的 \`composableEls.get(...)\`）。 */
export const ${getter} = (): ${iface} | null => bridge.get();
`;

let windowText = readFileSync(windowFile, 'utf8');

// ② import：桥三件套 + onUnmounted
if (!windowText.includes(`${kebab}-bridge`)) {
	windowText = windowText.replace(
		/import \{ ([^}]*useControlRefs[^}]*) \} from '@app\/composables\/control-refs';/,
		(match) =>
			`${match}\nimport {\n\t${provide},\n\t${reset},\n\ttype ${iface}\n} from '@app/composables/${kebab}-bridge';`
	);
	windowText = windowText.replace(
		/import \{ onMounted \} from 'vue';/,
		"import { onMounted, onUnmounted } from 'vue';"
	);
	windowText = windowText.replace(
		/import \{ onMounted, (?!onUnmounted)/,
		'import { onMounted, onUnmounted, '
	);
}

// ③ bridgeApi：插在 onMounted 之前
if (!windowText.includes('bridgeApi')) {
	const api = [
		'/** 控件级能力：schema 载入时要候选项，但 schema 不该知道控件 id。 */',
		`const bridgeApi: ${iface} = {`,
		`\t${method}: (items) => {`,
		...controlIds.map((id) => `\t\tcontrols['${id}']?.loadItems?.(items);`),
		'\t}',
		'};',
		''
	].join('\n');
	windowText = windowText.replace(/(\n)(onMounted\()/, `\n${api}\n$2`);
}

// ④ onMounted 首行 provide + 卸载注销
if (!windowText.includes(`${provide}(bridgeApi)`)) {
	windowText = windowText.replace(
		/onMounted\(\(\) => \{\n/,
		`onMounted(() => {\n\t${provide}(bridgeApi);\n\tonUnmounted(() => ${reset}(bridgeApi));\n`
	);
}

if (!APPLY) {
	console.log(`· ${windowFile}: 将补桥 ${iface}（${controlIds.join(', ')}）`);
} else {
	writeFileSync(bridgeFile, bridgeSource);
	writeFileSync(windowFile, windowText);
	console.log(`✎ ${windowFile} + ${bridgeFile}`);
}
