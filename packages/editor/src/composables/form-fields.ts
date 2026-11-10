export interface FormFieldControl {
	read?: () => unknown;
	write?: (value: unknown) => void;
}

export type FieldControlGetter = (id: string) => FormFieldControl | null | undefined;

/**
 * 把 `data` 写进 `form`，并顺带写进对应控件。
 *
 * `getControl` 是**必填**的：窗口迁成控件表之后，表单读写按逻辑 id 走表
 * （`useControlRefs().controlOf` 或 `toControl(fieldEls[id])`），不再回落到 `ElementRegistry`。
 */
export const setFormFields = <T extends object>(
	form: T,
	data: Partial<T>,
	fieldById: Record<string, keyof T>,
	getControl: FieldControlGetter
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
	getControl: FieldControlGetter
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
