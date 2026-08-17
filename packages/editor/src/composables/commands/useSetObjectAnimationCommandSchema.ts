import '@app/legacy/module/command/setObjectAnimation.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

type ObjectRef = {
	type: string;
	[k: string]: unknown;
};

export function useSetObjectAnimationCommandSchema() {
	const { form, save, load } = useCommandSchema('setObjectAnimation', {
		onLoad() {
			getFocus($('#setObjectAnimation-sort'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const sort = (params.sort ?? 'actor') as string;
		const object = (params.object ?? { type: 'trigger' }) as ObjectRef;
		const tint = (params.tint ?? [0, 0, 0, 0]) as number[];
		const isActor = sort === 'actor' || sort === 'components';
		load({
			...params,
			sort,
			actor: isActor ? object : { type: 'trigger' },
			trigger: sort === 'trigger' ? object : { type: 'trigger' },
			animation: sort === 'animation' ? object : { type: 'trigger' },
			'tint-0': tint[0],
			'tint-1': tint[1],
			'tint-2': tint[2],
			'tint-3': tint[3]
		});
	};
	const onSave = (): void => {
		const sort = read($('#setObjectAnimation-sort')) ?? form.sort;
		const operation = read($('#setObjectAnimation-operation')) ?? form.operation;
		let object: ObjectRef;
		switch (sort) {
			case 'actor':
			case 'components':
				object = read($('#setObjectAnimation-actor')) ?? (form.actor as ObjectRef);
				break;
			case 'trigger':
				object = read($('#setObjectAnimation-trigger')) ?? (form.trigger as ObjectRef);
				break;
			case 'animation':
				object = read($('#setObjectAnimation-animation')) ?? (form.animation as ObjectRef);
				break;
			default:
				return;
		}
		let red = read($('#setObjectAnimation-tint-0')) ?? form['tint-0'];
		let green = read($('#setObjectAnimation-tint-1')) ?? form['tint-1'];
		let blue = read($('#setObjectAnimation-tint-2')) ?? form['tint-2'];
		let gray = read($('#setObjectAnimation-tint-3')) ?? form['tint-3'];
		switch (operation) {
			case 'set-tint':
				break;
			case 'set-rgb':
				gray = 0;
				break;
			case 'set-gray':
				red = 0;
				green = 0;
				blue = 0;
				break;
		}
		const easingId = read($('#setObjectAnimation-easingId')) ?? form.easingId;
		const duration = read($('#setObjectAnimation-duration')) ?? form.duration;
		const wait = read($('#setObjectAnimation-wait')) ?? form.wait;
		if ('set-tint|set-rgb|set-gray'.includes(operation as string)) {
			Command.save?.({
				sort,
				object,
				operation,
				tint: [red, green, blue, gray],
				easingId,
				duration,
				wait
			});
		} else if (operation === 'set-opacity') {
			Command.save?.({
				sort,
				object,
				operation,
				opacity: read($('#setObjectAnimation-opacity')) ?? form.opacity,
				easingId,
				duration,
				wait
			});
		} else if (operation === 'set-offsetY') {
			Command.save?.({
				sort,
				object,
				operation,
				offsetY: read($('#setObjectAnimation-offsetY')) ?? form.offsetY,
				easingId,
				duration,
				wait
			});
		} else if (operation === 'set-rotation') {
			Command.save?.({
				sort,
				object,
				operation,
				rotation: read($('#setObjectAnimation-rotation')) ?? form.rotation,
				easingId,
				duration,
				wait
			});
		}
	};
	Command.cases.setObjectAnimation.customLoad = onLoad;
	Command.cases.setObjectAnimation.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
