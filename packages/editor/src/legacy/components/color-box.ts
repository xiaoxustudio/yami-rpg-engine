import { createColorBoxElement, type ColorBoxApi } from '@ui-kit';
import { Color } from '@app/legacy/tools/color-picker-window';

export function createColorBox(): ColorBoxApi {
	return createColorBoxElement({ colorPicker: (box) => Color.open(box) });
}
