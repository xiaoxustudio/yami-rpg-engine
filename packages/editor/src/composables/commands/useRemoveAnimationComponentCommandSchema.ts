import { read } from '@app/utils/element-utils';
import { composableEls } from '@app/composables/element-registry';
import { Animation } from '@app/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';
import type { YamiElement } from '@app/types/element-api';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.removeAnimationComponent = new CommandSchema({
	name: 'removeAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'motion', default: '', required: true }
	],
	customParse({
		actor,
		animationId,
		motion
	}: {
		actor: unknown;
		animationId: unknown;
		motion: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseFileName!(animationId))
			.push(Command.parseEnumString!(motion));
		return [
			{ color: 'actor' },
			{
				text: t('command.removeAnimationComponent') + Token(': ')
			},
			{ text: words.join() }
		];
	}
});

export function useRemoveAnimationComponentCommandSchema() {
	const { form, save, load } = useCommandSchema('removeAnimationComponent', {
		skipWrite: true,
		onLoad() {
			requestFocus('removeAnimationComponent-actor');
		}
	});
	const writeHandler = (event: { value: string }): void => {
		if (!event.value) return;
		const elMotion = composableEls.get('removeAnimationComponent-motion') as YamiElement;
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		elMotion.write2(read(elMotion));
	};
	return { form, save, load, writeHandler };
}
