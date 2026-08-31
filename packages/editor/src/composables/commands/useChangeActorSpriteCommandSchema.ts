/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read, write } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.changeActorSprite = new CommandSchema({
	name: 'changeActorSprite',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'spriteId', default: '', required: true },
		{ key: 'image', default: '' }
	],
	customParse({
		actor,
		animationId,
		spriteId,
		image
	}: {
		actor: unknown;
		animationId: unknown;
		spriteId: unknown;
		image: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseFileName!(animationId))
			.push(Command.parseSpriteName!(animationId, spriteId))
			.push(Command.parseFileName!(image));
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorSprite') + Token(': ') },
			{ text: words.join() }
		];
	}
});

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
