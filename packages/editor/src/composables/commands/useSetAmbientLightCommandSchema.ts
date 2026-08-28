/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

type SetAmbientLightData = {
	red: number | string;
	green: number | string;
	blue: number | string;
	easingId: string;
	duration: number | string;
	wait: boolean | string;
};

Command.cases.setAmbientLight = new CommandSchema({
	name: 'setAmbientLight',
	fields: [
		{ key: 'red', default: 0 },
		{ key: 'green', default: 0 },
		{ key: 'blue', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	parseColor(red: number | string, green: number | string, blue: number | string) {
		const r = Command.parseVariableNumber!(red);
		const g = Command.parseVariableNumber!(green);
		const b = Command.parseVariableNumber!(blue);
		return 'RGB' + Token('(') + r + Token(', ') + g + Token(', ') + b + Token(')');
	},
	customParse({ red, green, blue, easingId, duration, wait }: SetAmbientLightData) {
		const words = Command.words
			.push(this.parseColor!(red, green, blue))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: t('command.setAmbientLight') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetAmbientLightCommandSchema() {
	return useCommandSchema('setAmbientLight', {
		onLoad() {
			getFocus(document.getElementById('setAmbientLight-red')!, 'all');
		}
	});
}
