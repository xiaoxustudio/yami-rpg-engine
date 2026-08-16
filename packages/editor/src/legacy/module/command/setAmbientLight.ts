import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
			{ text: Local.get!('command.setAmbientLight') + Token(': ') },
			{ text: words.join() }
		];
	}
});
