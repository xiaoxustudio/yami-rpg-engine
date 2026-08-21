import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
	const { form, save, load, commit } = useCommandSchema('getMultipleActors', {
		onLoad() {
			getFocus(document.getElementById('getMultipleActors-variable')!);
		}
	});
	const onSave = (): void => {
		const variable =
			read(document.getElementById('getMultipleActors-variable')!) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus(document.getElementById('getMultipleActors-variable')!);
			return;
		}
		const position =
			read(document.getElementById('getMultipleActors-position')!) ?? form.position;
		const area = (read(document.getElementById('getMultipleActors-area')!) ??
			form.area) as string;
		const selector = (read(document.getElementById('getMultipleActors-selector')!) ??
			form.selector) as string;
		const activation =
			read(document.getElementById('getMultipleActors-activation')!) ?? form.activation;
		let params1: Record<string, unknown>;
		switch (area) {
			case 'rectangle':
				params1 = {
					variable,
					position,
					area,
					width: read(document.getElementById('getMultipleActors-width')!) ?? form.width,
					height:
						read(document.getElementById('getMultipleActors-height')!) ?? form.height
				};
				break;
			default:
				params1 = {
					variable,
					position,
					area,
					radius:
						read(document.getElementById('getMultipleActors-radius')!) ?? form.radius
				};
				break;
		}
		let params2: Record<string, unknown>;
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				params2 = {
					selector,
					teamId:
						read(document.getElementById('getMultipleActors-teamId')!) ?? form.teamId
				};
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
