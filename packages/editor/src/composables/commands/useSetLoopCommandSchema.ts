import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

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
		onLoad() {
			getFocus(document.getElementById('setLoop-type'));
		}
	});
}
