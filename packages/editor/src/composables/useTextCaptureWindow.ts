/* oxlint-disable eslint/no-restricted-properties */
import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface FontForm {
	font: string;
}

export interface FontSizeForm {
	size: number;
}

export interface TextPositionForm {
	axis: string;
	operation: string;
	value: number;
}

export interface TextEffectForm {
	type: string;
	shadowOffsetX: number;
	shadowOffsetY: number;
	strokeWidth: number;
	color: string;
}

export interface InsertImageForm {
	mode: string;
	image: string;
	clip: number[];
	width: number;
	height: number;
}

export interface LocalVariableForm {
	key: string;
}

interface TextCaptureWindow {
	font: {
		form: FontForm;
		open: (font: string, callback: (form: FontForm) => void) => void;
		confirm: () => void;
	};
	fontSize: {
		form: FontSizeForm;
		open: (size: number, callback: (form: FontSizeForm) => void) => void;
		confirm: () => void;
	};
	textPosition: {
		form: TextPositionForm;
		open: (data: TextPositionForm, callback: (form: TextPositionForm) => void) => void;
		confirm: () => void;
	};
	textEffect: {
		form: TextEffectForm;
		open: (data: TextEffectForm, callback: (form: TextEffectForm) => void) => void;
		confirm: () => void;
	};
	image: {
		form: InsertImageForm;
		open: (data: InsertImageForm, callback: (form: InsertImageForm) => void) => void;
		confirm: () => void;
	};
	localVariable: {
		form: LocalVariableForm;
		open: (key: string, callback: (form: LocalVariableForm) => void) => void;
		confirm: () => void;
	};
}

const createTagWindow = <TForm extends object>(windowId: string) => {
	const form = reactive<TForm>({} as TForm);
	let callback: ((form: TForm) => void) | null = null;

	const open = (
		data: Partial<TForm>,
		cb: (form: TForm) => void,
		focusId: string | null
	): void => {
		callback = cb;
		getWindowStore().open(windowId);
		Object.assign(form, data);
		if (focusId) {
			getFocus(document.getElementById(focusId), 'all');
		}
	};

	const confirm = (validate: ((form: TForm) => string | null) | null): void => {
		const data = form as TForm;
		const focusId = validate?.(data);
		if (focusId) {
			getFocus(document.getElementById(focusId), 'all');
			return;
		}
		callback?.(data);
		getWindowStore().close(windowId);
	};

	return { form, open, confirm };
};

const font = createTagWindow<FontForm>('font');
const fontSize = createTagWindow<FontSizeForm>('fontSize');
const textPosition = createTagWindow<TextPositionForm>('textPosition');
const textEffect = createTagWindow<TextEffectForm>('textEffect');
const image = createTagWindow<InsertImageForm>('insertImage');
const localVariable = createTagWindow<LocalVariableForm>('localVariable');

export function useTextCaptureWindow(): TextCaptureWindow {
	return {
		font: {
			form: font.form,
			open: (fontName: string, cb: (form: FontForm) => void): void =>
				font.open({ font: fontName }, cb, 'font-font'),
			confirm: (): void => font.confirm((data) => (data.font ? null : 'font-font'))
		},
		fontSize: {
			form: fontSize.form,
			open: (size: number, cb: (form: FontSizeForm) => void): void =>
				fontSize.open({ size }, cb, 'fontSize-size'),
			confirm: (): void => fontSize.confirm(null)
		},
		textPosition: {
			form: textPosition.form,
			open: (data: TextPositionForm, cb: (form: TextPositionForm) => void): void =>
				textPosition.open(data, cb, null),
			confirm: (): void => textPosition.confirm(null)
		},
		textEffect: {
			form: textEffect.form,
			open: (data: TextEffectForm, cb: (form: TextEffectForm) => void): void =>
				textEffect.open(data, cb, null),
			confirm: (): void => textEffect.confirm(null)
		},
		image: {
			form: image.form,
			open: (data: InsertImageForm, cb: (form: InsertImageForm) => void): void =>
				image.open(data, cb, null),
			confirm: (): void => image.confirm((data) => (data.image ? null : 'insertImage-image'))
		},
		localVariable: {
			form: localVariable.form,
			open: (key: string, cb: (form: LocalVariableForm) => void): void =>
				localVariable.open({ key }, cb, 'localVariable-key'),
			confirm: (): void =>
				localVariable.confirm((data) => (data.key ? null : 'localVariable-key'))
		}
	};
}
