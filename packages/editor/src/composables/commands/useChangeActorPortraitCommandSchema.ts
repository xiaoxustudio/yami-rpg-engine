/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.changeActorPortrait = new CommandSchema({
	name: 'changeActorPortrait',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'mode', default: 'full' },
		{ key: 'portrait', default: '' },
		{ key: 'clip', default: [0, 0, 64, 64] }
	],
	parsePortraitClip(clip: number[]) {
		const label = t('command.changeActorPortrait.clip');
		const x = Command.setNumberColor!(clip[0]);
		const y = Command.setNumberColor!(clip[1]);
		const width = Command.setNumberColor!(clip[2]);
		const height = Command.setNumberColor!(clip[3]);
		return (
			label +
			Token('(') +
			x +
			Token(', ') +
			y +
			Token(', ') +
			width +
			Token(', ') +
			height +
			Token(')')
		);
	},
	customParse({
		actor,
		mode,
		portrait,
		clip
	}: {
		actor: unknown;
		mode: string;
		portrait: unknown;
		clip: number[];
	}) {
		const words = Command.words.push(Command.parseActor!(actor));
		switch (mode) {
			case 'full':
				words.push(Command.parseFileName!(portrait)).push(this.parsePortraitClip!(clip));
				break;
			case 'portrait':
				words.push(Command.parseFileName!(portrait));
				break;
			case 'clip':
				words.push(this.parsePortraitClip!(clip));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorPortrait') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useChangeActorPortraitCommandSchema() {
	const { form, load, commit } = useCommandSchema('changeActorPortrait', {
		onLoad() {
			getFocus(document.getElementById('changeActorPortrait-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('changeActorPortrait-actor')) ?? form.actor;
		const mode = read(document.getElementById('changeActorPortrait-mode')) ?? form.mode;
		const portrait =
			read(document.getElementById('changeActorPortrait-portrait')) ?? form.portrait;
		const clip = read(document.getElementById('changeActorPortrait-clip')) ?? form.clip;
		switch (mode) {
			case 'full':
				commit({ actor, mode, portrait, clip });
				break;
			case 'portrait':
				commit({ actor, mode, portrait });
				break;
			case 'clip':
				commit({ actor, mode, clip });
				break;
		}
	};
	Command.cases.changeActorPortrait.customSave = onSave;
	return { form, save: onSave, load };
}
