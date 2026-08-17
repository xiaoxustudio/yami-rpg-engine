import '@app/legacy/module/command/tintImage.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useTintImageCommandSchema() {
	const { form, save, load } = useCommandSchema('tintImage', {
		onLoad() {
			getFocus($('#tintImage-element'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const tint = (params.tint ?? [0, 0, 0, 0]) as number[];
		load({
			...params,
			'tint-0': tint[0],
			'tint-1': tint[1],
			'tint-2': tint[2],
			'tint-3': tint[3]
		});
		write($('#tintImage-filter'), tint);
	};
	const onSave = (): void => {
		const element = read($('#tintImage-element')) ?? form.element;
		const mode = read($('#tintImage-mode')) ?? form.mode;
		let red = read($('#tintImage-tint-0')) ?? form['tint-0'];
		let green = read($('#tintImage-tint-1')) ?? form['tint-1'];
		let blue = read($('#tintImage-tint-2')) ?? form['tint-2'];
		let gray = read($('#tintImage-tint-3')) ?? form['tint-3'];
		switch (mode) {
			case 'full':
				break;
			case 'rgb':
				gray = 0;
				break;
			case 'gray':
				red = 0;
				green = 0;
				blue = 0;
				break;
		}
		Command.save?.({
			element,
			mode,
			tint: [red, green, blue, gray],
			easingId: read($('#tintImage-easingId')) ?? form.easingId,
			duration: read($('#tintImage-duration')) ?? form.duration,
			wait: read($('#tintImage-wait')) ?? form.wait
		});
	};
	Command.cases.tintImage.customLoad = onLoad;
	Command.cases.tintImage.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
