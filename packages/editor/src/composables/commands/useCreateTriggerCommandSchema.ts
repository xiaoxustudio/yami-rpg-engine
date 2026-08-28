/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.createTrigger = new CommandSchema({
	name: 'createTrigger',
	fields: [
		{ key: 'triggerId', default: '' },
		{ key: 'caster', default: { type: 'trigger' } },
		{ key: 'origin', default: { type: 'actor', actor: { type: 'trigger' } } },
		{ key: 'angle', default: { type: 'direction', degrees: 0 } },
		{ key: 'distance', default: 0 },
		{ key: 'scale', default: 1 },
		{ key: 'timeScale', default: 1 }
	],
	customParse({
		triggerId,
		caster,
		origin,
		angle,
		distance,
		scale,
		timeScale
	}: {
		triggerId: unknown;
		caster: unknown;
		origin: unknown;
		angle: unknown;
		distance: unknown;
		scale: unknown;
		timeScale: unknown;
	}) {
		const casterName = Command.parseActor!(caster);
		const originName = Command.parsePosition!(origin);
		const words = Command.words
			.push(Command.parseVariableFile!(triggerId))
			.push(casterName)
			.push(originName.indexOf(casterName) === -1 ? originName : '')
			.push(Command.parseAngle!(angle))
			.push(Command.parseVariableNumber!(distance, 't'))
			.push(Command.parseVariableNumber!(scale))
			.push(Command.parseVariableNumber!(timeScale));
		return [
			{ color: 'skill' },
			{ text: t('command.createTrigger') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useCreateTriggerCommandSchema() {
	const { form, load, commit } = useCommandSchema('createTrigger', {
		onLoad() {
			getFocus(document.getElementById('createTrigger-triggerId'));
		}
	});
	const onSave = (): void => {
		const triggerId =
			read(document.getElementById('createTrigger-triggerId')) ?? form.triggerId;
		if (triggerId === '') {
			getFocus(document.getElementById('createTrigger-triggerId'));
			return;
		}
		commit({
			triggerId,
			caster: read(document.getElementById('createTrigger-caster')) ?? form.caster,
			origin: read(document.getElementById('createTrigger-origin')) ?? form.origin,
			angle: read(document.getElementById('createTrigger-angle')) ?? form.angle,
			distance: read(document.getElementById('createTrigger-distance')) ?? form.distance,
			scale: read(document.getElementById('createTrigger-scale')) ?? form.scale,
			timeScale: read(document.getElementById('createTrigger-timeScale')) ?? form.timeScale
		});
	};
	Command.cases.createTrigger.customSave = onSave;
	return { form, save: onSave, load };
}
