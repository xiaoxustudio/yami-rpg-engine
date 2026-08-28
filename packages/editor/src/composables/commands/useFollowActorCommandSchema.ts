/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.followActor = new CommandSchema({
	name: 'followActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } },
		{ key: 'mode', default: 'circle' },
		{ key: 'minDist', default: 1 },
		{ key: 'maxDist', default: 2 },
		{ key: 'offset', default: 0 },
		{ key: 'vertDist', default: 0 },
		{ key: 'bufferDist', default: 0 },
		{ key: 'navigate', default: true },
		{ key: 'bypass', default: false },
		{ key: 'once', default: false },
		{ key: 'wait', default: false }
	],
	parseActors(actor: unknown, target: unknown) {
		const sActor = Command.parseActor!(actor);
		const dActor = Command.parseActor!(target);
		return sActor + Token(' -> ') + dActor;
	},
	customParse({
		actor,
		target,
		mode,
		minDist,
		maxDist,
		offset,
		vertDist,
		bufferDist,
		navigate,
		bypass,
		once,
		wait
	}: {
		actor: unknown;
		target: unknown;
		mode: string;
		minDist: unknown;
		maxDist: unknown;
		offset: number;
		vertDist: number;
		bufferDist: number;
		navigate: unknown;
		bypass: unknown;
		once: unknown;
		wait: unknown;
	}) {
		if (bufferDist === undefined) {
			bufferDist = 0;
		}
		const words = Command.words
			.push(this.parseActors!(actor, target))
			.push(t('command.followActor.mode.' + mode))
			.push(
				Command.parseVariableNumber!(minDist) +
					Token(' ~ ') +
					Command.parseVariableNumber!(maxDist)
			);
		switch (mode) {
			case 'circle':
				words.push(Command.setNumberColor!(offset.toString()));
				break;
			case 'rectangle':
				words.push(Command.setNumberColor!(vertDist.toString()));
				break;
		}
		words.push(Command.setNumberColor!(bufferDist.toString()));
		if (navigate) {
			words.push(t('command.followActor.navigate'));
			if (bypass) {
				words.push(t('command.followActor.bypass'));
			}
		}
		if (once) {
			words.push(t('command.followActor.once'));
			words.push(Command.parseWait!(wait));
		}
		return [
			{ color: 'actor' },
			{ text: t('command.followActor') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useFollowActorCommandSchema() {
	const { form, load, commit } = useCommandSchema('followActor', {
		onLoad() {
			getFocus(document.getElementById('followActor-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('followActor-actor')) ?? form.actor;
		const target = read(document.getElementById('followActor-target')) ?? form.target;
		const mode = read(document.getElementById('followActor-mode')) ?? form.mode;
		const minDist = read(document.getElementById('followActor-minDist')) ?? form.minDist;
		const maxDist = read(document.getElementById('followActor-maxDist')) ?? form.maxDist;
		const bufferDist =
			read(document.getElementById('followActor-bufferDist')) ?? form.bufferDist;
		const navigate = read(document.getElementById('followActor-navigate')) ?? form.navigate;
		const bypass = navigate
			? { bypass: read(document.getElementById('followActor-bypass')) ?? form.bypass }
			: {};
		const once = read(document.getElementById('followActor-once')) ?? form.once;
		const wait = once
			? (read(document.getElementById('followActor-wait')) ?? form.wait)
			: false;
		switch (mode) {
			case 'circle':
				commit({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					offset: read(document.getElementById('followActor-offset')) ?? form.offset,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				});
				break;
			case 'rectangle':
				commit({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					vertDist:
						read(document.getElementById('followActor-vertDist')) ?? form.vertDist,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				});
				break;
		}
	};
	Command.cases.followActor.customSave = onSave;
	return { form, save: onSave, load };
}
