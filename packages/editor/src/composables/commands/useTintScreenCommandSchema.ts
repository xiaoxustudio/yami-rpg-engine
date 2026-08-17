import '@app/legacy/module/command/tintScreen.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useTintScreenCommandSchema() {
	const { form, save, load } = useCommandSchema('tintScreen', {
		onLoad() {
			getFocus($('#tintScreen-tint-0'), 'all');
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
		write($('#tintScreen-filter'), tint);
	};
	const onSave = (): void => {
		const tint = [
			read($('#tintScreen-tint-0')) ?? form['tint-0'],
			read($('#tintScreen-tint-1')) ?? form['tint-1'],
			read($('#tintScreen-tint-2')) ?? form['tint-2'],
			read($('#tintScreen-tint-3')) ?? form['tint-3']
		];
		Command.save?.({
			tint,
			easingId: read($('#tintScreen-easingId')) ?? form.easingId,
			duration: read($('#tintScreen-duration')) ?? form.duration,
			wait: read($('#tintScreen-wait')) ?? form.wait
		});
	};
	Command.cases.tintScreen.customLoad = onLoad;
	Command.cases.tintScreen.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
