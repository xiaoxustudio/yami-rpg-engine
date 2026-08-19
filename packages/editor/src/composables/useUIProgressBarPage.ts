import '@app/legacy/inspector/element-progress-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface ProgressBarForm {
	image: string;
	display: string;
	clip: number[];
	type: string;
	centerX: number;
	centerY: number;
	startAngle: number;
	centralAngle: number;
	step: number;
	progress: number;
	blend: string;
	colorMode: string;
	color: number[];
}

const PROGRESSBAR_KEYS: (keyof ProgressBarForm)[] = [
	'image',
	'display',
	'clip',
	'type',
	'centerX',
	'centerY',
	'startAngle',
	'centralAngle',
	'step',
	'progress',
	'blend',
	'colorMode'
];

export function useUIProgressBarPage() {
	const form = reactive<ProgressBarForm>({
		image: '',
		display: 'stretch',
		clip: [0, 0, 32, 32],
		type: 'horizontal',
		centerX: 0.5,
		centerY: 0.5,
		startAngle: -90,
		centralAngle: 360,
		step: 0,
		progress: 1,
		blend: 'normal',
		colorMode: 'texture',
		color: [0, 0, 0, 0]
	});

	const sync = (): void => {
		const target = Inspector?.uiProgressBar?.target as
			| Partial<ProgressBarForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of PROGRESSBAR_KEYS) {
			const value = target[key];
			if (value !== undefined) {
				(form as Record<string, unknown>)[key] = value;
			}
		}
		form.color = target.color ?? [0, 0, 0, 0];
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiProgressBar-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiProgressBar.update(
				Inspector.uiProgressBar.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
