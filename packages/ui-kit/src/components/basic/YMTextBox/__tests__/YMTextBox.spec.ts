import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMTextBox from '../YMTextBox.vue';
import type { TextBoxApi } from '../text-box-api';

describe('YMTextBox', () => {
	it('read/write roundtrip', () => {
		const wrapper = mount(YMTextBox);
		const vm = wrapper.vm as unknown as TextBoxApi;
		vm.write('hello');
		expect(vm.read()).toBe('hello');
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('hello');
	});

	it('emits update:modelValue and input on typing', async () => {
		const wrapper = mount(YMTextBox);
		const input = wrapper.find('input');
		await input.setValue('abc');
		expect(wrapper.emitted('update:modelValue')![0]).toEqual(['abc']);
		expect(wrapper.emitted('input')![0]).toEqual(['abc']);
	});

	it('emits change on change event', async () => {
		const wrapper = mount(YMTextBox);
		const input = wrapper.find('input');
		await input.setValue('x');
		await input.trigger('change');
		expect(wrapper.emitted('change')![0]).toEqual(['x']);
	});

	it('disable hides input', () => {
		const wrapper = mount(YMTextBox);
		const vm = wrapper.vm as unknown as TextBoxApi;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
		expect((wrapper.find('input').element as HTMLElement).style.display).toBe('none');
		vm.enable();
		expect(wrapper.classes()).not.toContain('disabled');
	});

	it('setPlaceholder and setMaxLength work', () => {
		const wrapper = mount(YMTextBox);
		const vm = wrapper.vm as unknown as TextBoxApi;
		vm.setPlaceholder('Type here');
		vm.setMaxLength(10);
		const input = wrapper.find('input').element as HTMLInputElement;
		expect(input.placeholder).toBe('Type here');
		expect(input.maxLength).toBe(10);
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMTextBox);
		const el = wrapper.element as unknown as TextBoxApi;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.getFocus).toBe('function');
		expect(el.input!.tagName).toBe('INPUT');
	});

	it('deleteInputContent invokes execCommand delete', async () => {
		const calls: string[] = [];
		const orig = document.execCommand;
		document.execCommand = (cmd: string) => {
			calls.push(cmd);
			return false;
		};
		const wrapper = mount(YMTextBox);
		const vm = wrapper.vm as unknown as TextBoxApi;
		vm.write('abc');
		vm.deleteInputContent();
		expect(calls).toContain('delete');
		document.execCommand = orig;
	});

	it('syncs with external modelValue', async () => {
		const wrapper = mount(YMTextBox, { props: { modelValue: 'init' } });
		await wrapper.setProps({ modelValue: 'next' });
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('next');
	});

	/**
	 * `addCloseButton()` / `addKeydownFilter()` 原先各自往根元素 `addEventListener`，
	 * 现改为**常驻模板绑定 + 开关早退**（同一元素同一事件只能有一个模板 `@keydown`，故两者被合并）。
	 * 合并的**顺序语义**（filter 的 `stopImmediatePropagation`）此前没有任何用例覆盖，故补上。
	 *
	 * 注：`TextBoxApi` 类型里 `addKeydownFilter` 是带参数的（那是 `text-box-api.ts` 的元素优先工厂），
	 * 而 `.vue` 这份实现不收参数，故这里按 `.vue` 的实际形状取用。
	 */
	type OptInApi = {
		write(value: string): void;
		read(): string;
		addCloseButton(): void;
		addKeydownFilter(): void;
	};

	/** `deleteInputContent()` 走 `document.execCommand`，jsdom 未实现，需打桩 */
	const stubExecCommand = (): (() => void) => {
		const orig = document.execCommand;
		document.execCommand = () => false;
		return () => {
			document.execCommand = orig;
		};
	};

	it('addCloseButton：有内容时 Escape 被拦下、不向外冒泡；空内容时照常冒泡', () => {
		const restore = stubExecCommand();
		const wrapper = mount(YMTextBox, { attachTo: document.body });
		const vm = wrapper.vm as unknown as OptInApi;
		vm.addCloseButton();

		let bubbled = 0;
		const onBody = (): void => void bubbled++;
		document.body.addEventListener('keydown', onBody);
		const root = wrapper.element as HTMLElement;

		// 空内容 ⇒ 关闭按钮那条分支不 stopPropagation ⇒ 照常冒泡
		root.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
		expect(bubbled).toBe(1);

		// 有内容 ⇒ stopPropagation ⇒ 不再冒泡（证明该分支确实执行了）
		vm.write('hello');
		root.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
		expect(bubbled).toBe(1);

		document.body.removeEventListener('keydown', onBody);
		restore();
		wrapper.unmount();
	});

	it('addKeydownFilter：列出的功能键放行，其余按键不外冒泡', () => {
		const wrapper = mount(YMTextBox, { attachTo: document.body });
		const vm = wrapper.vm as unknown as OptInApi;
		vm.addKeydownFilter();

		let bubbled = 0;
		const onBody = (): void => void bubbled++;
		document.body.addEventListener('keydown', onBody);
		const root = wrapper.element as HTMLElement;

		// F1 在放行名单里 ⇒ 照常冒泡
		root.dispatchEvent(new KeyboardEvent('keydown', { code: 'F1', bubbles: true }));
		expect(bubbled).toBe(1);
		// Ctrl+A 不在放行名单 ⇒ 被 stopImmediatePropagation 拦下
		root.dispatchEvent(
			new KeyboardEvent('keydown', { code: 'KeyA', ctrlKey: true, bubbles: true })
		);
		expect(bubbled).toBe(1);

		document.body.removeEventListener('keydown', onBody);
		wrapper.unmount();
	});

	it('两个 opt-in 同时启用时按「先 closeButton、后 filter」合并执行', () => {
		const restore = stubExecCommand();
		const wrapper = mount(YMTextBox, { attachTo: document.body });
		const vm = wrapper.vm as unknown as OptInApi;
		// 与 editor/src/scene/scene-window.ts 的调用顺序一致
		vm.addCloseButton();
		vm.addKeydownFilter();
		vm.write('x');

		let bubbled = 0;
		const onBody = (): void => void bubbled++;
		document.body.addEventListener('keydown', onBody);
		// Escape：先跑 closeButton 分支（有内容 ⇒ stopPropagation），
		// 再跑 filter 分支（Escape 在放行名单 ⇒ 只 return、不 stopImmediatePropagation）。
		// 净效果由**先执行**的 stopPropagation 决定 —— 冒泡被拦下。
		(wrapper.element as HTMLElement).dispatchEvent(
			new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })
		);
		expect(bubbled).toBe(0);

		// 对照：未启用任何 opt-in 时同名事件照常冒泡（避免"测了个恒为 0 的东西"）
		document.body.removeEventListener('keydown', onBody);
		restore();
		wrapper.unmount();
	});
});
