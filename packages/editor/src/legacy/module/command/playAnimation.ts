import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
	onInitialize() {
		$('#playAnimation-confirm').on('click', () => this.save!());
		$('#playAnimation-mode').loadItems([
			{ name: 'Position', value: 'position' },
			{ name: 'Actor', value: 'actor' }
		]);
		$('#playAnimation-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'position', targets: [$('#playAnimation-position')] },
				{ case: 'actor', targets: [$('#playAnimation-actor')] }
			]);
		$('#playAnimation-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#playAnimation-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		// playAnimation-animationId write 经 Vue 模板转发（playAnimation.vue @write → Command.cases.playAnimation.writeHandler）
	},
	writeHandler(event: { value: string }) {
		const elMotion = $('#playAnimation-motion');
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		elMotion.write2(read(elMotion));
	},
	parseRotatable(rotatable: boolean) {
		return rotatable ? Local.get!('command.playAnimation.rotatable') : '';
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
				const bind = Local.get!('command.playAnimation.bind');
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
			{ text: Local.get!('command.playAnimation') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		mode = 'position',
		position = { type: 'actor', actor: { type: 'trigger' } },
		actor = { type: 'trigger' },
		animationId = '',
		motion = '',
		rotatable = false,
		priority = 0,
		offsetY = 0,
		angle = 0,
		speed = 1,
		wait = false
	}) {
		const write = getElementWriter('playAnimation');
		write('mode', mode);
		write('position', position);
		write('actor', actor);
		write('animationId', animationId);
		write('motion', motion);
		write('rotatable', rotatable);
		write('priority', priority);
		write('offsetY', offsetY);
		write('angle', angle);
		write('speed', speed);
		write('wait', wait);
		getFocus($('#playAnimation-mode'));
	},
	customSave() {
		const read = getElementReader('playAnimation');
		const mode = read('mode');
		const animationId = read('animationId');
		const motion = read('motion');
		const rotatable = read('rotatable');
		const priority = read('priority');
		const offsetY = read('offsetY');
		const angle = read('angle');
		const speed = read('speed');
		const wait = read('wait');
		if (animationId === '') {
			return getFocus($('#playAnimation-animationId'));
		}
		if (motion === '') {
			return getFocus($('#playAnimation-motion'));
		}
		switch (mode) {
			case 'position': {
				const position = read('position');
				Command.save!({
					mode,
					position,
					animationId,
					motion,
					rotatable,
					priority,
					offsetY,
					angle,
					speed,
					wait
				});
				break;
			}
			case 'actor': {
				const actor = read('actor');
				Command.save!({
					mode,
					actor,
					animationId,
					motion,
					rotatable,
					priority,
					offsetY,
					angle,
					speed,
					wait
				});
				break;
			}
		}
	}
});
