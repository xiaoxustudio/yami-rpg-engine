import '@app/legacy/module/command/changeActorSprite.ts';
import { getFocus, read, write } from '@app/utils/element-utils';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorSpriteCommandSchema() {
	const { form, save, load } = useCommandSchema('changeActorSprite', {
		onLoad() {
			getFocus(document.getElementById('changeActorSprite-actor'));
		}
	});
	const writeHandler = (event: { value: string }): void => {
		if (!event.value) return;
		const items = Animation.getSpriteListItems!(event.value);
		const elSpriteId = document.getElementById('changeActorSprite-spriteId')!;
		elSpriteId.loadItems(items);
		write(elSpriteId, read(elSpriteId));
	};
	return { form, save, load, writeHandler };
}
