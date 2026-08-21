import { useColorWindow } from '@app/composables/useColorWindow';
import { $, getElementReader, getElementWriter } from '@app/utils/dom';
import { relate, getRelativeCoords, on, read, setTooltip } from '@app/utils/element-utils';
import { File } from '@app/file/file-system-core.ts';
import { UI } from '@app/ui/ui-window.ts';
import { Menu } from '@app/components/menu-list.ts';
import { Data } from '@app/data/data-object.ts';
import { createGetter } from '@app/i18n';
import { Rename } from '@app/composables/useRenameWindow';

type ColorTarget = {
	input?: (value: number | string) => void;
};

type ColorDrag = PointerEvent & {
	mode: string;
};

export const Color = {
	target: null as unknown as ColorTarget | null,
	dragging: null as unknown as ColorDrag | null,
	paletteX: null as unknown as number,
	paletteY: null as unknown as number,
	pillarY: null as unknown as number,
	indexEnabled: null as unknown as boolean,
	initialize: null as unknown as () => void,
	open: null as unknown as (...args: unknown[]) => void,
	drawPalette: null as unknown as () => void,
	drawPillar: null as unknown as (...args: unknown[]) => void,
	drawViewer: null as unknown as (...args: unknown[]) => void,
	setPaletteCursor: null as unknown as (...args: unknown[]) => void,
	setPillarCursor: null as unknown as (...args: unknown[]) => void,
	getRGBFromPalette: null as unknown as () => [number, number, number],
	getRGBFromPillar: null as unknown as () => [number, number, number],
	getRGBAFromHex: null as unknown as (...args: unknown[]) => [number, number, number, number],
	getHexFromRGBA: null as unknown as (...args: unknown[]) => string,
	getCSSColorFromRGBA: null as unknown as (...args: unknown[]) => string,
	writeRGBAToInputs: null as unknown as (...args: unknown[]) => void,
	readRGBAFromInputs: null as unknown as () => unknown[],
	loadIndexedColors: null as unknown as () => void,
	simplifyHexColor: null as unknown as (...args: unknown[]) => string,
	windowClosed: null as unknown as (event: Event) => void,
	palettePointerdown: null as unknown as (event: ColorDrag) => void,
	pillarPointerdown: null as unknown as (event: ColorDrag) => void,
	indexedColorInput: null as unknown as (event: Event & { value?: string }) => void,
	indexedColorPointerdown: null as unknown as (event: PointerEvent) => void,
	pointerup: null as unknown as (event: PointerEvent) => void,
	pointermove: null as unknown as (event: PointerEvent) => void,
	hexBeforeinput: null as unknown as (event: InputEvent) => void,
	hexInput: null as unknown as (event: Event) => void,
	rgbaInput: null as unknown as (event: Event) => void,
	confirm: null as unknown as (event: Event) => void
};

Color.initialize = function (this: typeof Color) {
	if (!$('#color-hex')) return;
	$('#color-hex').setMaxLength(8);

	const colorIndex = $('#color-index') as HTMLElement & Record<'cancelable', boolean>;
	if (colorIndex) colorIndex.cancelable = true;

	$('#color')?.addEventListener('closed', this.windowClosed);
	on($('#color-palette-frame'), 'pointerdown', this.palettePointerdown);
	on($('#color-pillar-frame'), 'pointerdown', this.pillarPointerdown);
	$('[name="color-index"]').forEach((el) =>
		el.addEventListener('pointerdown', this.indexedColorPointerdown!)
	);
};

Color.open = function (this: typeof Color, ...args: unknown[]) {
	const target = args[0] as ColorTarget;
	const indexEnabled = (args[1] as boolean | undefined) ?? false;
	this.target = target;
	this.indexEnabled = indexEnabled;
	let color = read(target);
	let index: number | null = null;
	switch (typeof color) {
		case 'string':
			break;
		case 'number':
			index = color;
			color = Data.config.indexedColors[color].code;
			break;
	}
	useColorWindow().open(color, index, indexEnabled, (value) => {
		this.target?.input?.(value);
	});
	const rgba = this.getRGBAFromHex(color);
	this.drawPalette();
	this.drawPillar(rgba);
	this.setPillarCursor(0);
	this.writeRGBAToInputs(rgba);
	this.drawViewer(rgba);
	this.loadIndexedColors();
};

Color.drawPalette = function (this: typeof Color) {
	const canvas = $('#color-palette-canvas');
	if (!canvas.initialized) {
		canvas.initialized = true;

		const context = canvas.getContext('2d');
		const gradient = context.createLinearGradient(0.5, 0, 255.5, 0);
		gradient.addColorStop(0, '#ff0000');
		gradient.addColorStop(1 / 6, '#ffff00');
		gradient.addColorStop(2 / 6, '#00ff00');
		gradient.addColorStop(3 / 6, '#00ffff');
		gradient.addColorStop(4 / 6, '#0000ff');
		gradient.addColorStop(5 / 6, '#ff00ff');
		gradient.addColorStop(1, '#ff0000');
		context.fillStyle = gradient;
		context.fillRect(0, 0, 256, 194);

		context.fillStyle = '#ff0000';
		context.fillRect(0, 0, 1, 194);
		context.fillStyle = '#ffff00';
		context.fillRect(43, 0, 1, 194);
		context.fillStyle = '#00ff00';
		context.fillRect(85, 0, 1, 194);
		context.fillStyle = '#00ffff';
		context.fillRect(128, 0, 1, 194);
		context.fillStyle = '#0000ff';
		context.fillRect(170, 0, 1, 194);
		context.fillStyle = '#ff00ff';
		context.fillRect(213, 0, 1, 194);
		context.fillStyle = '#ff0000';
		context.fillRect(255, 0, 1, 194);

		const upperGradient = context.createLinearGradient(0, 0.5, 0, 96.5);
		upperGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
		upperGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
		context.fillStyle = upperGradient;
		context.fillRect(0, 0, 256, 97);
		const lowerGradient = context.createLinearGradient(0, 97.5, 0, 193.5);
		lowerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		lowerGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
		context.fillStyle = lowerGradient;
		context.fillRect(0, 97, 256, 97);

		this.setPaletteCursor(0, 193);
	}
};

Color.drawPillar = function (this: typeof Color, ...args: unknown[]) {
	const [r, g, b] = args[0] as [number, number, number];
	const canvas = $('#color-pillar-canvas');
	const context = canvas.getContext('2d');
	const gradient = context.createLinearGradient(0, 0.5, 0, 255.5);
	gradient.addColorStop(0, `rgba(${r}, ${g}, ${b})`);
	gradient.addColorStop(1, `rgba(255, 255, 255)`);
	context.fillStyle = gradient;
	context.fillRect(0, 0, 20, 256);
};

Color.drawViewer = function (this: typeof Color, ...args: unknown[]) {
	const [r, g, b, a] = args[0] as [number, number, number, number];
	$('#color-viewer').style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};

Color.setPaletteCursor = function (this: typeof Color, ...args: unknown[]) {
	const x = args[0] as number;
	const y = args[1] as number;
	const cursor = $('#color-palette-cursor');
	this.paletteX = x;
	this.paletteY = y;
	cursor.style.left = `${x - 5}px`;
	cursor.style.top = `${y - 5}px`;
};

Color.setPillarCursor = function (this: typeof Color, ...args: unknown[]) {
	const y = args[0] as number;
	const cursor = $('#color-pillar-cursor');
	this.pillarY = y;
	cursor.style.top = `${y}px`;
};

Color.getRGBFromPalette = function (this: typeof Color) {
	const x = Math.round(this.paletteX);
	const y = Math.round(this.paletteY);
	const canvas = $('#color-palette-canvas');
	const context = canvas.getContext('2d');
	const [r, g, b, a] = context.getImageData(x, y, 1, 1).data;
	return [r, g, b];
};

Color.getRGBFromPillar = function (this: typeof Color) {
	const y = Math.round(this.pillarY);
	const canvas = $('#color-pillar-canvas');
	const context = canvas.getContext('2d');
	const [r, g, b, a] = context.getImageData(0, y, 1, 1).data;
	return [r, g, b];
};

Color.getRGBAFromHex = function (this: typeof Color, ...args: unknown[]) {
	const hex = args[0] as string;
	const r = parseInt(hex.slice(0, 2) || '00', 16);
	const g = parseInt(hex.slice(2, 4) || '00', 16);
	const b = parseInt(hex.slice(4, 6) || '00', 16);
	const a = parseInt(hex.slice(6, 8) || 'ff', 16);
	return [r, g, b, a];
};

Color.getHexFromRGBA = function (this: typeof Color, ...args: unknown[]) {
	const rgba = args[0] as [number, number, number, number];
	const r = rgba[0].toString(16).padStart(2, '0');
	const g = rgba[1].toString(16).padStart(2, '0');
	const b = rgba[2].toString(16).padStart(2, '0');
	const a = rgba[3].toString(16).padStart(2, '0');
	return `${r}${g}${b}${a}`;
};

Color.getCSSColorFromRGBA = function (this: typeof Color, ...args: unknown[]) {
	const rgba = args[0] as [number, number, number, number];
	const [r, g, b, a] = rgba;
	return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};

Color.writeRGBAToInputs = function (this: typeof Color, ...args: unknown[]) {
	const [r, g, b, a] = args[0] as [number, number, number, number];
	const writer = getElementWriter('color');
	const hex = this.getHexFromRGBA([r, g, b, a]);
	writer('hex', this.simplifyHexColor(hex));
	writer('r', r);
	writer('g', g);
	writer('b', b);
	writer('a', a);
};

Color.readRGBAFromInputs = function (this: typeof Color) {
	const reader = getElementReader('color');
	const r = reader('r');
	const g = reader('g');
	const b = reader('b');
	const a = reader('a');
	return [r, g, b, a];
};

Color.loadIndexedColors = function (this: typeof Color) {
	const radios = document.getElementsByName('color-index');
	const colors = Data.config.indexedColors;
	const length = colors.length;
	for (let i = 0; i < length; i++) {
		const radio = radios[i];
		const color = colors[i];
		const rgba = this.getRGBAFromHex(color.code);
		const csscolor = this.getCSSColorFromRGBA(rgba);
		radio.style.backgroundColor = csscolor;
		setTooltip(radio, color.name);
	}
};

Color.simplifyHexColor = (function IIFE() {
	const regexp = /^([0-9a-f]{6})ff$/i;
	return function (this: typeof Color, ...args: unknown[]) {
		const hex = args[0] as string;
		return hex.replace(regexp, '$1');
	};
})();

Color.windowClosed = function (this: typeof Color, event: Event) {
	$('#color-index').reset();
	if (this.dragging) {
		this.pointerup(this.dragging);
	}
	useColorWindow().onWindowClosed();
}.bind(Color);

Color.palettePointerdown = function (this: typeof Color, event: ColorDrag) {
	switch (event.button) {
		case 0:
		case -1: {
			if (!this.dragging) {
				this.dragging = event;
				event.mode = 'palette';
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
			}
			const canvas = $('#color-palette-canvas');
			const coords = getRelativeCoords(event, canvas);
			const x = Math.clamp(coords.x, 0, 255);
			const y = Math.clamp(coords.y, 0, 193);
			this.setPaletteCursor(x, y);

			const rgb = this.getRGBFromPalette();
			const a = read($('#color-a'));
			const rgba = [...rgb, a];
			this.drawPillar(rgb);
			this.setPillarCursor(0);
			this.writeRGBAToInputs(rgba);
			this.drawViewer(rgba);
			$('#color-index').reset();
			break;
		}
	}
}.bind(Color);

Color.pillarPointerdown = function (this: typeof Color, event: ColorDrag) {
	switch (event.button) {
		case 0:
		case -1: {
			if (!this.dragging) {
				this.dragging = event;
				event.mode = 'pillar';
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
			}
			const canvas = $('#color-pillar-canvas');
			const coords = getRelativeCoords(event, canvas);
			const y = Math.clamp(coords.y, 0, 255);
			this.setPillarCursor(y);

			const rgb = this.getRGBFromPillar();
			const a = read($('#color-a'));
			const rgba = [...rgb, a];
			this.writeRGBAToInputs(rgba);
			this.drawViewer(rgba);
			$('#color-index').reset();
			break;
		}
	}
}.bind(Color);

Color.indexedColorInput = function (this: typeof Color, event: Event & { value?: string }) {
	const index = event.value;
	const hex = Data.config.indexedColors[index].code;
	const rgba = this.getRGBAFromHex(hex);
	this.drawPillar(rgba);
	this.setPillarCursor(0);
	this.writeRGBAToInputs(rgba);
	this.drawViewer(rgba);
	if (!this.indexEnabled) {
		$('#color-index').reset();
	}
}.bind(Color);

Color.indexedColorPointerdown = function (this: typeof Color, event: PointerEvent) {
	switch (event.button) {
		case 2: {
			const element = event.target as HTMLElement & { dataValue?: string };
			const index = element.dataValue;
			const indexedColor = Data.config.indexedColors[index];
			const get = createGetter('menuIndexedColor');
			Menu.popup(
				{
					x: event.clientX,
					y: event.clientY
				},
				[
					{
						label: get('saveColor'),
						click: () => {
							const rgba = this.readRGBAFromInputs();
							const hex = this.getHexFromRGBA(rgba);
							const csscolor = this.getCSSColorFromRGBA(rgba);
							if (indexedColor.code !== hex) {
								indexedColor.code = hex;
								element.style.backgroundColor = csscolor;
								UI.updateIndexedColor(index);
								File.planToSave!(Data.manifest.project.config);
							}
						}
					},
					{
						label: get('rename'),
						click: () => {
							Rename.open(indexedColor.name, (name: string) => {
								indexedColor.name = name;
								setTooltip(element, name);
								File.planToSave!(Data.manifest.project.config);
							});
						}
					}
				]
			);
			break;
		}
	}
}.bind(Color);

Color.pointerup = function (this: typeof Color, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(Color);

Color.pointermove = function (this: typeof Color, event: PointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'palette':
				return this.palettePointerdown(event);
			case 'pillar':
				return this.pillarPointerdown(event);
		}
	}
}.bind(Color);

Color.hexBeforeinput = function (this: typeof Color, event: InputEvent) {
	if (event.inputType === 'insertText' && typeof event.data === 'string') {
		const regexp = /[^0-9a-f]/i;
		if (regexp.test(event.data)) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
};

Color.hexInput = function (this: typeof Color, event: Event) {
	const reader = getElementReader('color');
	const writer = getElementWriter('color');
	const oldHex = reader('hex');
	const newHex = oldHex.replace(/[^0-9a-f]/gi, '');
	const [r, g, b, a] = this.getRGBAFromHex(newHex);
	if (oldHex !== newHex) {
		writer('hex', newHex);
	}
	writer('r', r);
	writer('g', g);
	writer('b', b);
	writer('a', a);
	this.drawPillar([r, g, b]);
	this.setPillarCursor(0);
	this.drawViewer([r, g, b, a]);
	$('#color-index').reset();
}.bind(Color);

Color.rgbaInput = function (this: typeof Color, event: Event) {
	const reader = getElementReader('color');
	const writer = getElementWriter('color');
	const r = reader('r');
	const g = reader('g');
	const b = reader('b');
	const a = reader('a');
	const hex = this.getHexFromRGBA([r, g, b, a]);
	writer('hex', this.simplifyHexColor(hex));
	this.drawPillar([r, g, b]);
	this.setPillarCursor(0);
	this.drawViewer([r, g, b, a]);
	$('#color-index').reset();
}.bind(Color);

Color.confirm = function (this: typeof Color, event: Event) {
	useColorWindow().confirm();
};
