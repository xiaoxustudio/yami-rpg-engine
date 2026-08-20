import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

type SetAnimationComponentData = {
	actor: unknown;
	animationId: string;
	motion: string;
	operation: string;
	angle: unknown;
	scale: number;
	speed: number;
	opacity: number;
	priority: number;
	offsetY: number;
	spriteId: string;
	image: string;
	playMotion: string;
	wait: boolean;
};

Command.cases.setAnimationComponent = new CommandSchema({
	name: 'setAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '' },
		{ key: 'motion', default: '' },
		{ key: 'operation', default: 'set-angle' },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } },
		{ key: 'scale', default: 1 },
		{ key: 'speed', default: 1 },
		{ key: 'opacity', default: 1 },
		{ key: 'priority', default: 0 },
		{ key: 'offsetY', default: 0 },
		{ key: 'spriteId', default: '' },
		{ key: 'image', default: '' },
		{ key: 'playMotion', default: '' },
		{ key: 'wait', default: false }
	],
	parsePriority(priority: number) {
		const abs = Command.setNumberColor!(Math.abs(priority));
		return priority === 0 ? abs : priority > 0 ? Token('+') + abs : Token('-') + abs;
	},
	parseOffsetY(offsetY: number) {
		const abs = Command.setNumberColor!(Math.abs(offsetY)) + 'px';
		return offsetY >= 0 ? abs : Token('-') + abs;
	},
	customParse({
		actor,
		animationId,
		motion,
		operation,
		angle,
		scale,
		speed,
		opacity,
		priority,
		offsetY,
		spriteId,
		image,
		playMotion,
		wait
	}: SetAnimationComponentData) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseFileName!(animationId))
			.push(Command.parseEnumString!(motion))
			.push(t('command.setAnimationComponent.' + operation));
		switch (operation) {
			case 'set-angle':
				words.push(Command.parseAngle!(angle));
				break;
			case 'set-scale':
				words.push(Command.parseVariableNumber!(scale));
				break;
			case 'set-speed':
				words.push(Command.parseVariableNumber!(speed));
				break;
			case 'set-opacity':
				words.push(Command.parseVariableNumber!(opacity));
				break;
			case 'set-priority':
				words.push(this.parsePriority!(priority));
				break;
			case 'set-offsetY':
				words.push(this.parseOffsetY!(offsetY));
				break;
			case 'set-sprite':
				words.push(Command.parseSpriteName!(animationId, spriteId));
				words.push(Command.parseFileName!(image));
				break;
			case 'play-motion':
				words.push(Command.parseEnumString!(playMotion));
				words.push(Command.parseWait!(wait));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.setAnimationComponent') + Token(': ') },
			{ text: words.join() }
		];
	}
});
