import '@/module/command/changeActorSprite.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorSpriteCommandSchema() {
	const { form, save, load } = useCommandSchema('changeActorSprite', {
		onLoad() {
			getFocus($('#changeActorSprite-actor'));
		}
	});
	const writeHandler = (event: { value: string }): void => {
		if (!event.value) return;
		const items = Animation.getSpriteListItems!(event.value);
		const elSpriteId = $('#changeActorSprite-spriteId');
		elSpriteId.loadItems(items);
		write(elSpriteId, read(elSpriteId));
	};
	return { form, save, load, writeHandler };
}
