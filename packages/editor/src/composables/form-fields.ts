import { composableEls } from './element-registry';
import { registryElement } from '@app/utils/element-registry';

export interface FormFieldControl {
	read?: () => unknown;
	write?: (value: unknown) => void;
}

export type FieldControlGetter = (id: string) => FormFieldControl | null | undefined;

const registryControl: FieldControlGetter = (id) =>
	registryElement<HTMLElement & FormFieldControl>(composableEls, id);

export const setFormFields = <T extends object>(
	form: T,
	data: Partial<T>,
	fieldById: Record<string, keyof T>,
	getControl: FieldControlGetter = registryControl
): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(fieldById)) {
		if (!(field in data)) continue;
		const control = getControl(id);
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

export const getFormFields = <T extends object>(
	form: T,
	fieldById: Record<string, keyof T>,
	getControl: FieldControlGetter = registryControl
): T => {
	const data = { ...form } as T;
	for (const [id, field] of Object.entries(fieldById)) {
		const control = getControl(id);
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};
