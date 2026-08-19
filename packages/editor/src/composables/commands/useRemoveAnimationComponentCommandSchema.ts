import '@app/legacy/module/command/removeAnimationComponent.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRemoveAnimationComponentCommandSchema() {
	const { form, save, load } = useCommandSchema('removeAnimationComponent', {
		onLoad() {
			getFocus(document.getElementById('removeAnimationComponent-actor'));
		}
	});
	const writeHandler = (event: { value: string }): void => {
		if (!event.value) return;
		const elMotion = document.getElementById('removeAnimationComponent-motion')!;
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		elMotion.write2(read(elMotion));
	};
	return { form, save, load, writeHandler };
}
