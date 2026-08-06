import { createColorBoxElement, type ColorBoxApi } from '@ui-kit';
import { Color } from '@/tools/color-picker-window';

export function createColorBox(): ColorBoxApi {
	return createColorBoxElement({ colorPicker: (box) => (Color as any).open(box) });
}
