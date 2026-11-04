#!/usr/bin/env node
/**
 * 给命令窗口补「控件级能力桥」的窗口侧接线（通用版）。
 *
 * 一个窗口的能力可能是多种形状，所以用 spec 描述每个方法怎么落到控件上：
 *   loadItems:a,b      → 方法 `loadItems(items)`，把 items 灌给控件 a、b
 *   setLanguage:a      → 方法 `setLanguage(value)`，`controls['a']?.write?.(value)`
 *   getFilter:a        → 方法 `getFilter()`，返回 `controls['a']?.read?.()`
 *   clear:a            → 方法 `clear()`，`controls['a']?.clear?.()`
 *
 * 用法：
 *   node scripts/oneoff/wire-command-bridges.mjs <窗口名> <bridgeId> "loadItems:a,b;setLanguage:c" [--apply]
 *
 * 只做接线与生成桥模块；**schema 侧的调用点是手改**（形状各不相同，机械替换容易改错）。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'packages/editor/src';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const APPLY = process.argv.includes('--apply');
const [windowName, bridgeId, spec] = args;
if (!windowName || !bridgeId || !spec) {
	console.error(
		'用法：wire-command-bridges.mjs <窗口名> <bridgeId> "<spec>" [--dir=tools] [--apply]'
	);
	process.exit(1);
}

/** 窗口所在目录（默认 commands；tools / inspector 等族传 `--dir=`）。 */
const DIR = process.argv.find((a) => a.startsWith('--dir='))?.slice('--dir='.length) ?? 'commands';

const kebab = bridgeId.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const Pascal = `${bridgeId.charAt(0).toUpperCase()}${bridgeId.slice(1)}`;
const iface = `${Pascal}Bridge`;
const provide = `provide${iface}`;
const reset = `reset${iface}`;
const getter = `get${iface}`;

/** spec → 方法描述。 */
const methods = spec.split(';').map((part) => {
	const [name, ids] = part.split(':');
	const controlIds = (ids ?? '').split(',').filter(Boolean);
	const kind = name.startsWith('get')
		? 'read'
		: name.startsWith('set')
			? 'write'
			: name === 'clear'
				? 'clear'
				: 'loadItems';
	return { name, controlIds, kind };
});

const signature = (m) =>
	m.kind === 'read'
		? `\t${m.name}(): unknown;`
		: m.kind === 'loadItems'
			? `\t${m.name}(items: unknown[]): void;`
			: m.kind === 'write'
				? `\t${m.name}(value: unknown): void;`
				: `\t${m.name}(): void;`;

const body = (m) => {
	const param = m.kind === 'loadItems' ? 'items' : m.kind === 'write' ? 'value' : '';
	const lines = [`\t${m.name}: (${param}) => {`];
	if (m.kind === 'read') {
		lines.push(`\t\treturn controls['${m.controlIds[0]}']?.read?.();`);
	} else if (m.kind === 'write') {
		lines.push(`\t\tcontrols['${m.controlIds[0]}']?.write?.(value);`);
	} else if (m.kind === 'clear') {
		for (const id of m.controlIds) lines.push(`\t\tcontrols['${id}']?.clear?.();`);
	} else {
		for (const id of m.controlIds) lines.push(`\t\tcontrols['${id}']?.loadItems?.(items);`);
	}
	lines.push('\t}');
	return lines.join('\n');
};

const bridgeSource = `/**
 * ${bridgeId} 窗口的**控件级能力桥**（模块级强类型）。
 *
 * 命令 schema 载入/保存时要读写窗口里的控件。旧做法是按 id 从 \`composableEls\` 取元素再调
 * \`loadItems\` / \`write\` / \`read\`；窗口迁成模板 ref 后控件不再进注册表，于是这些能力由窗口
 * 实现、经模块桥交出 —— schema 不再知道控件 id。
 *
 * 实现收口在 \`composables/form-bridge.ts\`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface ${iface} {
${methods.map(signature).join('\n')}
}

const bridge = createFormBridge<${iface}>('${bridgeId}');

/** 组件挂载时登记。 */
export const ${provide} = (api: ${iface}): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const ${reset} = (api: ${iface}): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null（等价于原来的 \`composableEls.get(...)\`）。 */
export const ${getter} = (): ${iface} | null => bridge.get();
`;

const windowFile = `${ROOT}/components/${DIR}/${windowName}.vue`;
let text = readFileSync(windowFile, 'utf8');

if (!text.includes(`${kebab}-bridge`)) {
	text = text.replace(
		/import \{ ([^}]*useControlRefs[^}]*) \} from '@app\/composables\/control-refs';/,
		(match) =>
			`${match}\nimport {\n\t${provide},\n\t${reset},\n\ttype ${iface}\n} from '@app/composables/${kebab}-bridge';`
	);
	text = text.replace(
		/import \{ onMounted \} from 'vue';/,
		"import { onMounted, onUnmounted } from 'vue';"
	);
	text = text.replace(
		/import \{ onMounted, (?!onUnmounted)/,
		'import { onMounted, onUnmounted, '
	);
}

if (!text.includes('bridgeApi')) {
	const api = [
		'/** 控件级能力：schema 载入/保存要用，但 schema 不该知道控件 id。 */',
		`const bridgeApi: ${iface} = {`,
		methods.map(body).join(',\n'),
		'};',
		''
	].join('\n');
	text = text.replace(/(\n)(onMounted\()/, `\n${api}\n$2`);
}

if (!text.includes(`${provide}(bridgeApi)`)) {
	text = text.replace(
		/onMounted\(\(\) => \{\n/,
		`onMounted(() => {\n\t${provide}(bridgeApi);\n\tonUnmounted(() => ${reset}(bridgeApi));\n`
	);
}

if (!APPLY) {
	console.log(`· ${windowFile}: 桥 ${iface}（${methods.map((m) => m.name).join(', ')}）`);
} else {
	writeFileSync(`${ROOT}/composables/${kebab}-bridge.ts`, bridgeSource);
	writeFileSync(windowFile, text);
	console.log(`✎ ${windowFile} + composables/${kebab}-bridge.ts`);
}
