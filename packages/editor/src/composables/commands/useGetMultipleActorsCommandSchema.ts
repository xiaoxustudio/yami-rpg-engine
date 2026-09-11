import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.getMultipleActors = new CommandSchema({
	name: 'getMultipleActors',
	fields: [
		{ key: 'variable', default: { type: 'local', key: '' } },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'area', default: 'rectangle' },
		{ key: 'width', default: 1 },
		{ key: 'height', default: 1 },
		{ key: 'radius', default: 0.5 },
		{ key: 'selector', default: 'enemy' },
		{ key: 'teamId', default: () => Data.teams.list[0].id },
		{ key: 'activation', default: 'active' }
	],
	customParse({
		variable,
		position,
		area,
		width,
		height,
		radius,
		selector,
		teamId,
		activation
	}: {
		variable: unknown;
		position: unknown;
		area: string;
		width: unknown;
		height: unknown;
		radius: unknown;
		selector: string;
		teamId: unknown;
		activation: string;
	}) {
		const actors = Command.parseVariable!(variable, 'object', true);
		const words = Command.words
			.push(Command.parsePosition!(position))
			.push(t('command.getMultipleActors.' + area));
		switch (area) {
			case 'rectangle':
				words.push(Command.parseVariableNumber!(width, 't'));
				words.push(Command.parseVariableNumber!(height, 't'));
				break;
			case 'circle':
				words.push(Command.parseVariableNumber!(radius, 't'));
				break;
		}
		const selectorLabel = Command.parseActorSelector!(selector);
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				words.push(
					selectorLabel + Token('(') + Command.parseVariableTeam!(teamId) + Token(')')
				);
				break;
			case 'any':
				words.push(selectorLabel);
				break;
		}
		words.push(t('command.getMultipleActors.' + activation));
		return [
			{ color: 'actor' },
			{ text: t('command.getMultipleActors') + Token(': ') },
			{ text: actors + Token(' = ') + words.join() }
		];
	}
});

export function useGetMultipleActorsCommandSchema() {
	const { form, load, commit } = useCommandSchema('getMultipleActors', {
		skipWrite: true,
		onLoad() {
			requestFocus('getMultipleActors-variable');
		}
	});
	const onSave = (): void => {
		const variable = form.variable as { key: string };
		if (VariableGetter.isNone!(variable)) {
			requestFocus('getMultipleActors-variable');
			return;
		}
		const position = form.position;
		const area = form.area as string;
		const selector = form.selector as string;
		const activation = form.activation;
		let params1: Record<string, unknown>;
		switch (area) {
			case 'rectangle':
				params1 = { variable, position, area, width: form.width, height: form.height };
				break;
			default:
				params1 = { variable, position, area, radius: form.radius };
				break;
		}
		let params2: Record<string, unknown>;
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				params2 = { selector, teamId: form.teamId };
				break;
			default:
				params2 = { selector };
				break;
		}
		commit({ ...params1, ...params2, activation });
	};
	Command.cases.getMultipleActors.customSave = onSave;
	return { form, save: onSave, load };
}
