import { emitCustom } from '@app/events/custom-events';
window.addEventListener(
	'resize',
	(function IIFE() {
		let dpr = window.devicePixelRatio;
		return (_event: Event): void => {
			if (dpr !== window.devicePixelRatio) {
				dpr = window.devicePixelRatio;
				emitCustom('dprchange');
			}
		};
	})()
);
