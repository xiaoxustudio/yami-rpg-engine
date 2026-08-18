import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

type PlayAnimationCommandData = {
	mode: string;
	position: unknown;
	actor: unknown;
	animationId: string;
	motion: string;
	rotatable: boolean;
	priority: number;
	offsetY: number | string;
	angle: unknown;
	speed: unknown;
	wait: unknown;
};

Command.cases.playAnimation = new CommandSchema({
	name: 'playAnimation',
	fields: [
		{ key: 'mode', default: 'position' },
		{ key: 'position', default: { type: 'actor', actor: { type: 'trigger' } } },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '' },
		{ key: 'motion', default: '' },
		{ key: 'rotatable', default: false },
		{ key: 'priority', default: 0 },
		{ key: 'offsetY', default: 0 },
		{ key: 'angle', default: 0 },
		{ key: 'speed', default: 1 },
		{ key: 'wait', default: false }
	],
	parseRotatable(rotatable: boolean) {
		return rotatable ? t('command.playAnimation.rotatable') : '';
	},
	parsePriority(priority: number) {
		if (priority === 0) return '';
		const abs = Command.setNumberColor!(Math.abs(priority));
		return priority > 0 ? Token('+') + abs : Token('-') + abs;
	},
	parseOffsetY(offsetY: number | string) {
		let num;
		if (typeof offsetY === 'number') num = Command.setNumberColor!(Math.abs(offsetY)) + 'px';
		return typeof offsetY === 'number'
			? offsetY > 0
				? num
				: Token('-') + num
			: Command.parseVariableNumber!(offsetY);
	},
	customParse({
		mode,
		position,
		actor,
		animationId,
		motion,
		rotatable,
		priority,
		offsetY,
		angle,
		speed,
		wait
	}: PlayAnimationCommandData) {
		const words = Command.words;
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition!(position));
				break;
			case 'actor': {
				const bind = t('command.playAnimation.bind');
				words.push(bind + Token('(') + Command.parseActor!(actor) + Token(')'));
				break;
			}
		}
		words
			.push(Command.parseFileName!(animationId))
			.push(Command.parseEnumString!(motion))
			.push(this.parseRotatable!(rotatable))
			.push(this.parsePriority!(priority))
			.push(this.parseOffsetY!(offsetY))
			.push(Command.parseVariableNumber!(angle, '°'))
			.push(Command.parseVariableNumber!(speed))
			.push(Command.parseWait!(wait));
		return [
			{ color: 'object' },
			{ text: t('command.playAnimation') + Token(': ') },
			{ text: words.join() }
		];
	}
});
