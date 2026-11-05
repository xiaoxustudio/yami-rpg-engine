import { readFileSync, writeFileSync } from 'node:fs';

/**
 * `inspector-registry.spec.ts`：UIImagePage 那三条（登记进 inspectorEls / 元素 id 一致 / 卸载清空）
 * 改成守新的「页面控件表」接缝；FileActorPage 那几条不动（它还没迁）。
 */
const file = 'packages/editor/src/inspector/__tests__/inspector-registry.spec.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { inspectorEls } from '../element-registry.ts';",
	"import { inspectorEls } from '../element-registry.ts';\nimport { getUiElementControls } from '@app/composables/ui-element-page-controls';"
);

// 第一条：UIImagePage 的登记断言 → 控件表断言
text = text.replace(
	/it\('UIImagePage：模板 :ref 登记的控件进入 inspectorEls', async \(\) => \{[\s\S]*?\n\t\}\);/,
	`it('UIImagePage：模板 :ref 的控件进入页面控件表（不再进 inspectorEls）', async () => {
		const wrapper = mount(UIImagePage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await nextTick();

		const table = getUiElementControls();
		expect(table).toBeTruthy();
		for (const id of [
			'uiElement-name',
			'uiElement-pointerEvents',
			'uiElement-general-group',
			'uiElement-transform-group',
			'uiElement-events-group',
			'uiElement-scripts-group',
			'uiElement-parameter-pane',
			'uiElement-events',
			'uiElement-scripts'
		]) {
			expect(table?.[id], \`控件表缺少 \${id}\`).toBeTruthy();
			expect(inspectorEls.get(id), \`\${id} 不该再进 inspectorEls\`).toBeFalsy();
		}

		wrapper.unmount();
		expect(getUiElementControls(), '卸载后应注销').toBeNull();
	});`
);

writeFileSync(file, text);
console.log(
	/UIImagePage：模板 :ref 的控件进入页面控件表/.test(text)
		? '✓ spec 第一条已改'
		: '! 第一条没匹配上'
);
