import { readFileSync, writeFileSync } from 'node:fs';

/**
 * `attribute-enum-registry.spec.ts`：Enum 侧改用「句柄表」口径（Attribute 侧不动 ——
 * 它还没迁）。Enum 的断言从「注册表里有 7 个 id」改成「挂载后交出句柄表、initialize 从中绑定」。
 */
const file = 'packages/editor/src/attribute/__tests__/attribute-enum-registry.spec.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { Enum, enumEls } from '@app/enum/enum-window.ts';",
	"import { Enum } from '@app/enum/enum-window.ts';\nimport { getEnumHandles } from '@app/composables/enum-handles';"
);
text = text.replace('\t\tenumEls.clear();\n', '');

text = text.replace(
	/	it\('Enum\.vue 登记元素且 Enum\.initialize 从注册表绑定', async \(\) => \{[\s\S]*?\n	\}\);\n/,
	`	it('Enum.vue 挂载后交出句柄表，Enum.initialize 从中绑定', async () => {
		const wrapper = mount(EnumWindow, { attachTo: document.body });
		await nextTick();

		const handles = getEnumHandles();
		expect(handles).toBeTruthy();
		for (const id of [
			'enum',
			'enum-list',
			'enum-properties-flex',
			'enum-searcher',
			'enum-name',
			'enum-value',
			'enum-note'
		]) {
			expect(document.getElementById(id), \`DOM 里缺少 \${id}\`).toBeInstanceOf(HTMLElement);
		}

		Enum.initialize!();
		expect(Enum.list).toBe(handles?.list);
		expect(Enum.panel).toBe(handles?.panel);
		expect(Enum.inputs.name).toBe(handles?.name);

		wrapper.unmount();
		expect(getEnumHandles(), '卸载后应注销').toBeNull();
	});
`
);
writeFileSync(file, text);
console.log(/enumEls/.test(text) ? '! 仍有 enumEls 引用' : '✓ spec 已改口径');
