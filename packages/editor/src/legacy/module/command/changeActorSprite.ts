import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changeActorSprite = new CommandSchema({
	name: 'changeActorSprite',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'spriteId', default: '', required: true },
		{ key: 'image', default: '' }
	],
	onInitialize() {
		$('#changeActorSprite-confirm').on('click', () => this.save!());
		// changeActorSprite-animationId write 经 Vue 模板转发（changeActorSprite.vue @write → Command.cases.changeActorSprite.writeHandler）
	},
	writeHandler(event: any) {
		const items = Animation.getSpriteListItems!(event.value);
		const elSpriteId = $('#changeActorSprite-spriteId');
		elSpriteId.loadItems(items);
		write(elSpriteId, read(elSpriteId));
	},
	customParse({ actor, animationId, spriteId, image }: any) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseFileName!(animationId))
			.push(Command.parseSpriteName!(animationId, spriteId))
			.push(Command.parseFileName!(image));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.changeActorSprite') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#changeActorSprite-actor'));
	}
});
