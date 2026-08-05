import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMParameterPane from '../YMParameterPane.vue';

const makeInput = (): any => {
	const el: any = document.createElement('div');
	el.classList.add('mock-input');
	el.dataValue = null;
	el.read = () => el.dataValue;
	el.write = (v: any) => {
		el.dataValue = v;
	};
	el.enable = () => {};
	el.disable = () => {};
	el.update = () => {};
	el.clear = () => {};
	el.tabIndex = 0;
	return el;
};

const makeControls = (): any => ({
	checkBox: () => {
		const input = makeInput();
		input.classList.add('check-box');
		return input;
	},
	colorBox: () => {
		const input = makeInput();
		input.classList.add('color-box');
		return input;
	},
	keyboardBox: () => {
		const input = makeInput();
		input.classList.add('keyboard-box');
		return input;
	},
	customBox: () => {
		const input = makeInput();
		input.classList.add('custom-box');
		return input;
	},
	detailBox: () => {
		const box: any = document.createElement('div');
		box.classList.add('detail-box');
		box.meta = null;
		box.data = null;
		return box;
	},
	detailSummary: () => {
		const s: any = document.createElement('div');
		s.classList.add('detail-summary');
		return s;
	},
	numberBox: () => {
		const input = makeInput();
		input.classList.add('number-box');
		return input;
	},
	numberVar: () => {
		const input = makeInput();
		input.classList.add('number-var');
		return input;
	},
	selectBox: () => {
		const input = makeInput();
		input.classList.add('select-box');
		return input;
	},
	textBox: () => {
		const input = makeInput();
		input.classList.add('text-box');
		return input;
	}
});

const makeTypeRegistry = (): any => ({
	get: (type: string) => ({
		create: (_pane: HTMLElement, param: any) => {
			const label = document.createElement('div');
			label.classList.add('text');
			const input = makeInput();
			input.classList.add('type-' + type);
			return { tag: type, label, input };
		}
	})
});

const makeProps = (overrides: any = {}) => ({
	controls: makeControls(),
	typeRegistry: makeTypeRegistry(),
	dataManifest: () => ({ guidMap: {} }),
	plugin: { reconstruct: () => false, checkValidate: () => true },
	localize: (key: string) => key,
	...overrides
});

describe('YMParameterPane', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMParameterPane, { props: makeProps() });
		expect(wrapper.element.classList.contains('parameter-pane')).toBe(true);
		const el = wrapper.element as any;
		for (const name of [
			'bind',
			'rewrite',
			'update',
			'clear',
			'on',
			'createCheckBox',
			'createNumberBox',
			'createTextBox',
			'createSelectBox',
			'createCustomBox',
			'applyAffix'
		]) {
			expect(typeof el[name], name).toBe('function');
		}
	});

	it('update renders parameter rows from script data', () => {
		const wrapper = mount(YMParameterPane, {
			props: makeProps({
				dataManifest: () => ({
					guidMap: {
						s1: {
							parameters: [
								{ key: 'a', type: 'text-box', alias: 'alpha', value: 'A1' },
								{ key: 'b', type: 'number-box', alias: 'beta', value: 5 }
							],
							langMap: { update: () => new Map() },
							manager: { states: {} },
							overview: undefined
						}
					}
				})
			})
		});
		const el = wrapper.element as any;
		const scriptList: any = document.createElement('div');
		scriptList.classList.add('param-list');
		scriptList.data = [{ id: 's1', parameters: { a: 'A1', b: 5 } }];
		scriptList.object = { update: () => {} };
		scriptList.history = { save: () => {} };
		el.bind(scriptList);
		el.update();
		expect(wrapper.element.querySelectorAll('.detail-box').length).toBe(1);
		expect(wrapper.element.querySelectorAll('.mock-input').length).toBe(2);
		expect(wrapper.element.querySelector('.text').textContent).toBe('a');
		const inputs = wrapper.element.querySelectorAll('.mock-input');
		expect((inputs[0] as any).dataValue).toBe('A1');
		expect((inputs[1] as any).dataValue).toBe(5);
	});

	it('bind wraps param-list object.update', () => {
		const wrapper = mount(YMParameterPane, { props: makeProps() });
		const el = wrapper.element as any;
		let updates = 0;
		const scriptList: any = document.createElement('div');
		scriptList.classList.add('param-list');
		scriptList.data = [];
		scriptList.object = {
			update: () => updates++
		};
		el.bind(scriptList);
		scriptList.object.update();
		expect(updates).toBe(1);
		expect(el.getData).toBeTypeOf('function');
	});

	it('componentChange updates parameters and dispatches change', () => {
		const wrapper = mount(YMParameterPane, {
			props: makeProps({
				dataManifest: () => ({
					guidMap: {
						s1: {
							parameters: [{ key: 'a', type: 'text-box', alias: 'alpha' }],
							langMap: { update: () => new Map() },
							manager: { states: {} }
						}
					}
				})
			})
		});
		const el = wrapper.element as any;
		const scriptList: any = document.createElement('div');
		scriptList.classList.add('param-list');
		const params = { a: 'A1' };
		scriptList.data = [{ id: 's1', parameters: params }];
		scriptList.object = { update: () => {} };
		scriptList.history = { save: () => {} };
		el.bind(scriptList);
		el.update();
		const input = wrapper.element.querySelector('.mock-input') as any;
		input.dataValue = 'A2';
		input.parameters = params;
		input.key = 'a';
		let changed = 0;
		el.addEventListener('change', () => changed++);
		input.dispatchEvent(new Event('change', { bubbles: true }));
		expect(params.a).toBe('A2');
		expect(changed).toBe(1);
	});

	it('clear removes rendered content', () => {
		const wrapper = mount(YMParameterPane, {
			props: makeProps({
				dataManifest: () => ({
					guidMap: {
						s1: {
							parameters: [{ key: 'a', type: 'text-box', alias: 'alpha' }],
							langMap: { update: () => new Map() },
							manager: { states: {} }
						}
					}
				})
			})
		});
		const el = wrapper.element as any;
		const scriptList: any = document.createElement('div');
		scriptList.classList.add('param-list');
		scriptList.data = [{ id: 's1', parameters: { a: 'A1' } }];
		scriptList.object = { update: () => {} };
		el.bind(scriptList);
		el.update();
		expect(wrapper.element.querySelectorAll('.mock-input').length).toBe(1);
		el.clear();
		expect(wrapper.element.querySelectorAll('.mock-input').length).toBe(0);
	});

	it('applyAffix adds prefix and suffix elements', () => {
		const wrapper = mount(YMParameterPane, {
			props: makeProps({
				measureText: () => ({ width: 10 })
			})
		});
		const el = wrapper.element as any;
		const input = makeInput();
		const innerInput: any = document.createElement('input');
		input.appendChild(innerInput);
		el.applyAffix(input, { prefix: '$', suffix: 'px' });
		expect(input.querySelector('.param-affix.left')?.textContent).toBe('$');
		expect(input.querySelector('.param-affix.right')?.textContent).toBe('px');
	});
});
