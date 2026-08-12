import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSelectVar from '../YMSelectVar.vue';
import YMSelectBox from '../../YMSelectBox/YMSelectBox.vue';

const items = [
	{ value: 'hp', name: 'HP' },
	{ value: 'mp', name: 'MP' }
];

describe('repro variableGetter relate', () => {
	it('relate hides preset-key when type is local', async () => {
		const presetKey = mount(YMSelectVar, { props: { items } });
		const type = mount(YMSelectBox, { props: {} });
		const vmType = type.vm as unknown as Record<string, any>;
		vmType.enableHiddenMode();
		vmType.relate([
			{ case: 'local', targets: [document.createElement('div')] },
			{ case: 'global', targets: [document.createElement('div')] },
			{ case: 'actor', targets: [presetKey.element] }
		]);
		vmType.write('local');
		await type.vm.$nextTick();
		await presetKey.vm.$nextTick();
		const el = presetKey.element as HTMLElement;
		console.log(
			'preset-key after local: display=',
			el.style.display,
			'disabled=',
			el.classList.contains('disabled')
		);
		expect(el.style.display).toBe('none');
	});

	it('relate shows preset-key when type is actor', async () => {
		const presetKey = mount(YMSelectVar, { props: { items } });
		const type = mount(YMSelectBox, { props: {} });
		const vmType = type.vm as unknown as Record<string, any>;
		vmType.enableHiddenMode();
		vmType.relate([
			{ case: 'local', targets: [document.createElement('div')] },
			{ case: 'global', targets: [document.createElement('div')] },
			{ case: 'actor', targets: [presetKey.element] }
		]);
		vmType.write('actor');
		await type.vm.$nextTick();
		await presetKey.vm.$nextTick();
		const el = presetKey.element as HTMLElement;
		console.log(
			'preset-key after actor: display=',
			el.style.display,
			'disabled=',
			el.classList.contains('disabled')
		);
		expect(el.style.display).not.toBe('none');
	});
});
