import '@app/legacy/inspector/file-tileset-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';

interface FileTilesetForm {
	image: string;
	width: number;
	height: number;
	tileWidth: number;
	tileHeight: number;
	globalOffsetX: number;
	globalOffsetY: number;
	globalPriority: number;
}

const NODE_KEYS: (keyof FileTilesetForm)[] = [
	'image',
	'width',
	'height',
	'tileWidth',
	'tileHeight',
	'globalOffsetX',
	'globalOffsetY',
	'globalPriority'
];

export function useFileTilesetPage() {
	const form = reactive<FileTilesetForm>({
		image: '',
		width: 1,
		height: 1,
		tileWidth: 32,
		tileHeight: 32,
		globalOffsetX: 0,
		globalOffsetY: 0,
		globalPriority: 0
	});

	const sync = (): void => {
		const target = Inspector?.fileTileset?.target as
			| Partial<FileTilesetForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of NODE_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		Inspector?.fileTileset?.paramInput?.({ target: event?.target ?? document.activeElement });
		sync();
	};

	const onParamChange = (): void => {
		Inspector?.fileTileset?.paramInput?.();
		sync();
	};

	return { form, sync, onParamInput, onParamChange };
}
