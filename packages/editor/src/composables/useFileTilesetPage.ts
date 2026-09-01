import '@app/inspector/file-tileset-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

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

const TILESET_KEYS: (keyof FileTilesetForm)[] = [
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
	const form = reactive<Partial<FileTilesetForm>>({});

	const sync = (): void => {
		const target = Inspector?.fileTileset?.target as
			| Partial<FileTilesetForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of TILESET_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
		form.image = target.image ?? '';
	};

	const onParamInput = (event?: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileTileset-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileTileset.update(
				Inspector.fileTileset.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
