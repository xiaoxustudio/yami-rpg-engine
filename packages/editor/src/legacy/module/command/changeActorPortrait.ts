import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changeActorPortrait = new CommandSchema({
	name: 'changeActorPortrait',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'mode', default: 'full' },
		{ key: 'portrait', default: '' },
		{ key: 'clip', default: [0, 0, 64, 64] }
	],
	parsePortraitClip(clip: number[]) {
		const label = Local.get!('command.changeActorPortrait.clip');
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
			{ text: Local.get!('command.changeActorPortrait') + Token(': ') },
			{ text: words.join() }
		];
	}
});
