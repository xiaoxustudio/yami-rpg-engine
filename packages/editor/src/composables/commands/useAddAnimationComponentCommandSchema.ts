import '@app/legacy/module/command/addAnimationComponent.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useAddAnimationComponentCommandSchema() {
	const { form, save, load } = useCommandSchema('addAnimationComponent', {
		onLoad() {
			getFocus($('#addAnimationComponent-actor'));
		}
	});
	const writeHandler = (event: { value: string }): void => {
		if (!event.value) return;
		const elMotion = $('#addAnimationComponent-motion');
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		elMotion.write2(read(elMotion));
	};
	return { form, save, load, writeHandler };
}
