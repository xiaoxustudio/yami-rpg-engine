/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

Command.cases.setLoop = new CommandSchema({
	name: 'setLoop',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'loop', default: false }
	],
	parseLoop(loop: boolean) {
		switch (loop) {
			case false:
				return t('command.setLoop.once');
			case true:
				return t('command.setLoop.loop');
		}
	},
	customParse({ type, loop }: { type: unknown; loop: boolean }) {
		const words = Command.words.push(Command.parseAudioType!(type)).push(this.parseLoop!(loop));
		return [
			{ color: 'audio' },
			{ text: t('command.setLoop') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetLoopCommandSchema() {
	return useCommandSchema('setLoop', {
		skipWrite: true,
		onLoad() {
			requestFocus('setLoop-type');
		}
	});
}
