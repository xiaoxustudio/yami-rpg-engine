import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changeActorMotion = new CommandSchema({
	name: 'changeActorMotion',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'type', default: 'move' },
		{ key: 'motion', default: '', required: true }
	],
	onInitialize() {
		$('#changeActorMotion-confirm').on('click', () => this.save());
		$('#changeActorMotion-type').loadItems([
			{ name: 'Idle', value: 'idle' },
			{ name: 'Move', value: 'move' }
		]);
	},
	parseMapping(type: any, motion: any) {
		const motionType = Local.get('command.changeActorMotion.type.' + type);
		const motionName = Command.parseEnumString(motion);
		return motionType + Token(' -> ') + motionName;
	},
	customParse({ actor, type, motion }: any) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseMapping(type, motion));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorMotion') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#changeActorMotion-actor'));
	}
});
