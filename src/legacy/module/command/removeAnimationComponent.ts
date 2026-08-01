import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.removeAnimationComponent = new CommandSchema({
	name: 'removeAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'motion', default: '', required: true }
	],
	onInitialize() {
		$('#removeAnimationComponent-confirm').on('click', () => this.save());
		$('#removeAnimationComponent-animationId').on('write', (event: any) => {
			const elMotion = $('#removeAnimationComponent-motion');
			elMotion.loadItems(Animation.getMotionListItems(event.value));
			elMotion.write2(read(elMotion));
		});
	},
	customParse({ actor, animationId, motion }: any) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion));
		return [
			{ color: 'actor' },
			{
				text: Local.get('command.removeAnimationComponent') + Token(': ')
			},
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#removeAnimationComponent-actor'));
	}
});
