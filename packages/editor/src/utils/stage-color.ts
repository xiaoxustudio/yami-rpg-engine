import { INTRGBA } from '@app/utils/color-utils';
import { GL } from '@app/engine/webgl/webgl-init.ts';

/** 把颜色值归一化为 8 位 RGBA hex：8 位原样、6 位补 `ff`、其余退回 fallback。 */
export function safeHex(value: unknown, fallback: string): string {
	if (typeof value !== 'string') return fallback;
	if (/^[0-9a-fA-F]{8}$/.test(value)) return value;
	if (/^[0-9a-fA-F]{6}$/.test(value)) return `${value}ff`;
	return fallback;
}

export class StageColor {
	hex!: string;
	red!: number;
	green!: number;
	blue!: number;
	alpha!: number;
	onchange: () => void;

	constructor(hex: string, onchange: () => void) {
		this.input(hex);
		this.onchange = onchange;
	}

	read() {
		return this.hex;
	}

	input(hex: string) {
		if (this.hex !== hex) {
			this.hex = hex;
			this.red = parseInt(hex.slice(0, 2), 16) / 255;
			this.green = parseInt(hex.slice(2, 4), 16) / 255;
			this.blue = parseInt(hex.slice(4, 6), 16) / 255;
			this.alpha = parseInt(hex.slice(6, 8), 16) / 255;
			this.onchange?.();
		}
	}

	getINTRGBA() {
		return INTRGBA(this.hex);
	}

	getGLRGBA() {
		const sa = this.alpha;
		const da = 1 - sa;
		const rgba = StageColor.rgba;
		rgba[0] = GL.BACKGROUND_RED * da + this.red * sa;
		rgba[1] = GL.BACKGROUND_GREEN * da + this.green * sa;
		rgba[2] = GL.BACKGROUND_BLUE * da + this.blue * sa;
		return rgba;
	}

	static rgba = new Float64Array(4);
}
