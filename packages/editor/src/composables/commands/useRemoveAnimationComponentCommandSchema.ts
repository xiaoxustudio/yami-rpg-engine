import '@/module/command/removeAnimationComponent.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRemoveAnimationComponentCommandSchema() {
	const { form, save, load } = useCommandSchema('removeAnimationComponent', {
		onLoad() {
			getFocus($('#removeAnimationComponent-actor'));
		}
	});
	const writeHandler = (event: { value: string }): void => {
		if (!event.value) return;
		const elMotion = $('#removeAnimationComponent-motion');
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		elMotion.write2(read(elMotion));
	};
	return { form, save, load, writeHandler };
}
