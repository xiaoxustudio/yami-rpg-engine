import { INTRGBA } from '@app/utils/color-utils';
import { GL } from '@app/engine/webgl/webgl-init.ts';

/**
 *
 * ## 为什么必须归一化
 *
 * `StageColor.input()` 是 **8 位 RGBA hex** 的解析器：`slice(0,2)/slice(2,4)/slice(4,6)` 取 RGB，
 * **`slice(6,8)` 取 alpha**（`getGLRGBA()` 用它做混合）。所以只给 6 位 hex 会得到 `alpha = NaN`，
 * 进而把 NaN 交给 WebGL —— 实测 `'ffffff'` 与 `'ff1e1e1e'` 都是坏输入（2026-09-18）。
 *
 * 规则：**8 位原样 / 6 位补 `ff`（视为不透明）/ 其余退回 fallback**。
 * 默认配置给的就是 8 位（`services/project/config.ts` 的 `uiBackground: '00000000'`）。
 *
 * ## 为什么住在这里（而不是调用方各写一份）
 *
 * 这条规则此前只写在 `stores/ui.ts` 的 store setup 里，于是**同一个 config 只在一侧被归一化**：
 * store 侧归一化、`ui-events.ts` 的 `UI.loadFromConfig` 不归一化（它直接把
 * `config.colors.uiBackground` 喂给 `new StageColor(…)`）—— 两侧对同一个输入给出不同的 alpha。
 * 它属于「`StageColor` 的输入格式」，所以跟解析器放在一起；调用方从这里取同一份实现。
 */
export function safeHex(value: unknown, fallback: string): string {
	if (typeof value !== 'string') return fallback;
	if (/^[0-9a-fA-F]{8}$/.test(value)) return value;
	// 6 位视为不透明：alpha 补 ff，而不是留一个 NaN
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
