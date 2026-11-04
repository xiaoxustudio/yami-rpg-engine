import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { Menu } from '@app/components/menu-list';
import { Selection } from '../text-capture.ts';

vi.mock('@app/components/menu-list', () => ({
	Menu: { popup: vi.fn() }
}));

/**
 * 输入框右键菜单的绑定契约（Vue 迁移回归）：
 *  ① `.text-box` 的 input 在 initialize 时绑定（旧代码用的是恒为空的 `<text-box>` 标签）；
 *  ② initialize 之后才挂载的输入框，在右键按下的那一刻补绑；
 *  ③ 排除项（color-hex / command-searcher）不弹菜单；
 *  ④ 没有完整 `history` 的输入框（如文件搜索框）不因 canUndo 缺失而中断菜单。
 */
const created: HTMLElement[] = [];

const makeTextBox = (id: string, menu?: string): HTMLInputElement => {
	const box = document.createElement('div');
	box.className = 'text-box';
	box.id = id;
	if (menu) box.setAttribute('menu', menu);
	const input = document.createElement('input');
	box.appendChild(input);
	document.body.appendChild(box);
	created.push(box);
	return input;
};

const rightClick = async (input: HTMLInputElement): Promise<void> => {
	input.focus();
	input.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 2 }));
	input.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 2 }));
	await new Promise((resolve) => setTimeout(resolve, 0));
	await nextTick();
};

beforeEach(() => {
	setActivePinia(createPinia());
	vi.mocked(Menu.popup).mockClear();
});

afterEach(() => {
	for (const element of created.splice(0)) element.remove();
});

describe('文本捕获：输入框右键绑定', () => {
	it('.text-box 的 input 在 initialize 时绑定并能弹出菜单', async () => {
		const input = makeTextBox('probe-box', 'tag');
		Selection.initialize!();

		await rightClick(input);

		expect(Menu.popup).toHaveBeenCalledTimes(1);
	});

	it('initialize 之后挂载的输入框在右键按下时补绑', async () => {
		Selection.initialize!();
		const input = makeTextBox('late-probe-box', 'tag');

		await rightClick(input);

		expect(Menu.popup).toHaveBeenCalledTimes(1);
	});

	it('排除项（color-hex）不弹菜单', async () => {
		const input = makeTextBox('color-hex', 'tag');
		Selection.initialize!();

		await rightClick(input);

		expect(Menu.popup).not.toHaveBeenCalled();
	});

	it('没有 history 的输入框（搜索框）不中断菜单', async () => {
		const input = makeTextBox('search-probe');
		Selection.initialize!();

		await rightClick(input);

		expect(Menu.popup).toHaveBeenCalledTimes(1);
	});

	it('数字框等非 .text-box 的 input 不套文本标记菜单', async () => {
		const input = document.createElement('input');
		input.id = 'number-probe';
		document.body.appendChild(input);
		created.push(input);
		Selection.initialize!();

		await rightClick(input);

		expect(Menu.popup).not.toHaveBeenCalled();
	});
});
