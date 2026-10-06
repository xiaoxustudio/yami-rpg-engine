import { useColorWindow, type ColorForm } from '@app/composables/useColorWindow';
import { radioProxyMap, type RadioProxyElement } from '@ui-kit';
import { elementDataOf } from '@ui-kit';
import { createElementRegistry, registryElement } from '@app/utils/element-registry';
import { $ } from '@app/utils/dom';
import { relate, getRelativeCoords, on, read, setTooltip } from '@app/utils/element-utils';
import { File } from '@app/file/file-system-core.ts';
import { getUIStore } from '@app/stores/ui';
import { Menu } from '@app/components/menu-list.ts';
import { Data } from '@app/data/data-object.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Rename } from '@app/composables/useRenameWindow';
import type { YamiElement } from '@app/types/element-api';
import { clamp } from '@app/utils/math';

/** 元素注册表——由 Color.vue 在模板里登记 */
export const colorEls = createElementRegistry();

type ColorTarget = {
	input?: (value: number | string) => void;
};

type ColorDrag = PointerEvent & {
	mode: string;
};

export const Color = {} as ColorSlots;

// `paletteX` / `paletteY` / `pillarY` / `indexEnabled` 的真源在 `stores/color.ts`
// 桥在 `initialize()` 之前就装好 ⇒ 后面
// `this.indexEnabled = …`(:91)、`this.paletteX = …`(:183) 等写入全部落在 store 上。
// 数组只有这一份（store 侧不再导出白名单，避免两份漂移）。
import { getColorStore } from '@app/stores/color';

const colorBridgeKeys = ['paletteX', 'paletteY', 'pillarY', 'indexEnabled'] as const;

for (const key of colorBridgeKeys) {
	Object.defineProperty(Color, key, {
		get: () => getColorStore()[key],
		set: (value: unknown) => {
			Reflect.set(getColorStore(), key, value);
		},
		configurable: true
	});
}

/**
 * 延迟绑定槽：由 `initialize()` 填充（此前读到的是 undefined）。
 */
interface ColorSlots {
	target: ColorTarget | null;
	dragging: ColorDrag | null;
	paletteX: number;
	paletteY: number;
	pillarY: number;
	indexEnabled: boolean;
	initialize: () => void;
	open: (...args: unknown[]) => void;
	drawPalette: () => void;
	drawPillar: (...args: unknown[]) => void;
	drawViewer: (...args: unknown[]) => void;
	setPaletteCursor: (...args: unknown[]) => void;
	setPillarCursor: (...args: unknown[]) => void;
	getRGBFromPalette: () => [number, number, number];
	getRGBFromPillar: () => [number, number, number];
	getRGBAFromHex: (...args: unknown[]) => [number, number, number, number];
	getHexFromRGBA: (...args: unknown[]) => string;
	getCSSColorFromRGBA: (...args: unknown[]) => string;
	writeRGBAToInputs: (...args: unknown[]) => void;
	readRGBAFromInputs: () => unknown[];
	loadIndexedColors: () => void;
	simplifyHexColor: (...args: unknown[]) => string;
	windowClosed: (event: Event) => void;
	palettePointerdown: (event: ColorDrag) => void;
	pillarPointerdown: (event: ColorDrag) => void;
	indexedColorInput: (event: Event & { value?: string }) => void;
	indexedColorPointerdown: (event: PointerEvent) => void;
	pointerup: (event: PointerEvent) => void;
	pointermove: (event: PointerEvent) => void;
	hexBeforeinput: (event: InputEvent) => void;
	hexInput: (event: Event) => void;
	rgbaInput: (event: Event) => void;
	confirm: (event: Event) => void;
}

Color.initialize = function (this: typeof Color) {
	if (!colorEls.get('color-hex')) return;
	colorEls.get('color-hex')?.setMaxLength?.(8);

	// radio 组用 ui-kit 的 radioProxyMap（RadioProxyElement 类型化接口），不再查 DOM
	const colorIndex = radioProxyMap['color-index'] as RadioProxyElement | undefined;
	if (colorIndex) colorIndex.cancelable = true;

	(colorEls.get('color') as YamiElement)?.addEventListener('closed', this.windowClosed);
	on(colorEls.get('color-palette-frame') as YamiElement, 'pointerdown', this.palettePointerdown);
	on(colorEls.get('color-pillar-frame') as YamiElement, 'pointerdown', this.pillarPointerdown);
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
	const canvas = registryElement<HTMLCanvasElement>(colorEls, 'color-palette-canvas')!;
	// initialized now lives in element data (field removed from DATA_FIELDS)
	if (!elementDataOf<{ initialized?: boolean }>(canvas).initialized) {
		elementDataOf<{ initialized?: boolean }>(canvas).initialized = true;

		const context = canvas.getContext('2d', { willReadFrequently: true })!;
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
	const canvas = registryElement<HTMLCanvasElement>(colorEls, 'color-pillar-canvas')!;
	const context = canvas.getContext('2d', { willReadFrequently: true })!;
	const gradient = context.createLinearGradient(0, 0.5, 0, 255.5);
	gradient.addColorStop(0, `rgba(${r}, ${g}, ${b})`);
	gradient.addColorStop(1, `rgba(255, 255, 255)`);
	context.fillStyle = gradient;
	context.fillRect(0, 0, 20, 256);
};

Color.drawViewer = function (this: typeof Color, ...args: unknown[]) {
	const [r, g, b, a] = args[0] as [number, number, number, number];
	(colorEls.get('color-viewer') as YamiElement).style.backgroundColor =
		`rgba(${r}, ${g}, ${b}, ${a / 255})`;
};

Color.setPaletteCursor = function (this: typeof Color, ...args: unknown[]) {
	const x = args[0] as number;
	const y = args[1] as number;
	const cursor = colorEls.get('color-palette-cursor') as YamiElement;
	this.paletteX = x;
	this.paletteY = y;
	cursor.style.left = `${x - 5}px`;
	cursor.style.top = `${y - 5}px`;
};

Color.setPillarCursor = function (this: typeof Color, ...args: unknown[]) {
	const y = args[0] as number;
	const cursor = colorEls.get('color-pillar-cursor') as YamiElement;
	this.pillarY = y;
	cursor.style.top = `${y}px`;
};

Color.getRGBFromPalette = function (this: typeof Color) {
	const x = Math.round(this.paletteX);
	const y = Math.round(this.paletteY);
	const canvas = registryElement<HTMLCanvasElement>(colorEls, 'color-palette-canvas')!;
	const context = canvas.getContext('2d')!;
	const [r, g, b, _a] = context.getImageData(x, y, 1, 1).data;
	return [r, g, b];
};

Color.getRGBFromPillar = function (this: typeof Color) {
	const y = Math.round(this.pillarY);
	const canvas = registryElement<HTMLCanvasElement>(colorEls, 'color-pillar-canvas')!;
	const context = canvas.getContext('2d')!;
	const [r, g, b, _a] = context.getImageData(0, y, 1, 1).data;
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
	const hex = this.getHexFromRGBA([r, g, b, a]);
	Object.assign(useColorWindow().form, {
		hex: this.simplifyHexColor(hex),
		r,
		g,
		b,
		a
	} as Partial<ColorForm>);
};

Color.readRGBAFromInputs = function (this: typeof Color) {
	const { r, g, b, a } = useColorWindow().form;
	return [r, g, b, a];
};

Color.loadIndexedColors = function (this: typeof Color) {
	// 组内成员改读 proxy.group
	const radios = (radioProxyMap['color-index'] as RadioProxyElement | undefined)?.group ?? [];
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

Color.windowClosed = function (this: typeof Color, _event: Event) {
	radioProxyMap['color-index']?.reset();
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
			const canvas = registryElement<HTMLCanvasElement>(colorEls, 'color-palette-canvas')!;
			const coords = getRelativeCoords(event, canvas);
			const x = clamp(coords.x, 0, 255);
			const y = clamp(coords.y, 0, 193);
			this.setPaletteCursor(x, y);

			const rgb = this.getRGBFromPalette();
			const a = useColorWindow().form.a;
			const rgba = [...rgb, a];
			this.drawPillar(rgb);
			this.setPillarCursor(0);
			this.writeRGBAToInputs(rgba);
			this.drawViewer(rgba);
			radioProxyMap['color-index']?.reset();
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
			const canvas = registryElement<HTMLCanvasElement>(colorEls, 'color-pillar-canvas')!;
			const coords = getRelativeCoords(event, canvas);
			const y = clamp(coords.y, 0, 255);
			this.setPillarCursor(y);

			const rgb = this.getRGBFromPillar();
			const a = useColorWindow().form.a;
			const rgba = [...rgb, a];
			this.writeRGBAToInputs(rgba);
			this.drawViewer(rgba);
			radioProxyMap['color-index']?.reset();
			break;
		}
	}
}.bind(Color);

Color.indexedColorInput = function (this: typeof Color, event: Event & { value?: string }) {
	const index = event.value ?? 0;
	const hex = Data.config.indexedColors[index].code;
	const rgba = this.getRGBAFromHex(hex);
	this.drawPillar(rgba);
	this.setPillarCursor(0);
	this.writeRGBAToInputs(rgba);
	this.drawViewer(rgba);
	if (!this.indexEnabled) {
		radioProxyMap['color-index']?.reset();
	}
}.bind(Color);

Color.indexedColorPointerdown = function (this: typeof Color, event: PointerEvent) {
	switch (event.button) {
		case 2: {
			// `dataValue` 由 RadioBox 归一化：数字串（模板里的 `value="0"`）会落成 **number**
			// （RadioBox.vue 的 onMounted 用 numberPattern + parseFloat）。这里就是拿它当数组下标，
			// 同族的 `eslints.ts:256` / `auto-tile.ts:352` 也都按 number 声明
			// ⇒ 原先写的 `dataValue?: string` 是错的那一侧。
			const element = event.target as YamiElement & { dataValue: number };
			const index = element.dataValue;
			const indexedColor = Data.config.indexedColors[index];
			const get = (key: string) => t('menuIndexedColor.' + key);
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
								getUIStore().updateIndexedColor(index);
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
				return this.palettePointerdown(event as ColorDrag);
			case 'pillar':
				return this.pillarPointerdown(event as ColorDrag);
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

Color.hexInput = function (this: typeof Color, _event: Event) {
	const form = useColorWindow().form;
	const oldHex = form.hex;
	const newHex = oldHex.replace(/[^0-9a-f]/gi, '');
	const [r, g, b, a] = this.getRGBAFromHex(newHex);
	Object.assign(form, {
		hex: newHex,
		r,
		g,
		b,
		a
	} as Partial<ColorForm>);
	this.drawPillar([r, g, b]);
	this.setPillarCursor(0);
	this.drawViewer([r, g, b, a]);
	radioProxyMap['color-index']?.reset();
}.bind(Color);

Color.rgbaInput = function (this: typeof Color, _event: Event) {
	const { r, g, b, a } = useColorWindow().form;
	const hex = this.getHexFromRGBA([r, g, b, a]);
	useColorWindow().form.hex = this.simplifyHexColor(hex);
	this.drawPillar([r, g, b]);
	this.setPillarCursor(0);
	this.drawViewer([r, g, b, a]);
	radioProxyMap['color-index']?.reset();
}.bind(Color);

Color.confirm = function (this: typeof Color, _event: Event) {
	useColorWindow().confirm();
};
