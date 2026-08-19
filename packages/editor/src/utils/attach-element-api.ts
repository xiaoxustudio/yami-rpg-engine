export function attachElementApi<T extends HTMLElement, A extends Record<string, unknown>>(
	el: T,
	api: A
): void {
	for (const key of Object.keys(api)) {
		(el as unknown as Record<string, unknown>)[key] = api[key];
	}
}
