import { useZoomWindow, type ZoomForm } from '@app/composables/useZoomWindow';

export type { ZoomForm };

export const Zoom = {
	initialize: (): void => undefined,
	getFactor: (): number => useZoomWindow().getFactor(),
	open: (): void => {
		useZoomWindow().open();
	},
	confirm: (): void => {
		useZoomWindow().confirm();
	}
};
