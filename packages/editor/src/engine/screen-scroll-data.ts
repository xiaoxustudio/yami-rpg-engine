import { elementDataOf } from '@ui-kit';

export interface ScreenScrollData {
	rawScrollLeft: number;
	rawScrollTop: number;
}

export const screenScrollData = (el: unknown): ScreenScrollData =>
	elementDataOf<ScreenScrollData>(el);
