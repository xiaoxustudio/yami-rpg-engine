import { rect } from '../../../utils/dom';

export interface ScrollListenerApi {
	addScrollListener(mode: string, speed: number, shift: boolean, updater?: () => void): void;
	removeScrollListener(): void;
}

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

export function attachScrollListener(el: HTMLElement): ScrollListenerApi {
	let target = el;
	let highSpeed = 0;
	let lowSpeed = 0;
	let scrollHorizontal = false;
	let scrollVertical = false;
	let speedX = 0;
	let speedY = 0;
	let scrollUpdater: (() => void) | null = null;
	let rafId: number | null = null;
	let lastTime = 0;
	let bounds = { left: 0, top: 0, right: 0, bottom: 0 };

	const computeScrollDelta = (speed: number, deltaTime: number): number => {
		let delta = speed * deltaTime;
		const dpr = window.devicePixelRatio;
		const tolerance = 0.0001;
		if (delta > 0) {
			return Math.max(Math.floor(delta), 1) / dpr + tolerance;
		}
		if (delta < 0) {
			return Math.min(Math.ceil(delta), -1) / dpr + tolerance;
		}
		return 0;
	};

	const step = (time: number): void => {
		rafId = null;
		const deltaTime = lastTime === 0 ? 16 : time - lastTime;
		lastTime = time;
		const { scrollLeft, scrollTop } = target;
		if (speedX !== 0) {
			target.scrollLeft += computeScrollDelta(speedX, deltaTime);
		}
		if (speedY !== 0) {
			target.scrollTop += computeScrollDelta(speedY, deltaTime);
		}
		if (target.scrollLeft !== scrollLeft || target.scrollTop !== scrollTop) {
			scrollUpdater?.();
		}
		if (speedX !== 0 || speedY !== 0) {
			rafId = requestAnimationFrame(step);
		}
	};

	const pointermove = (event: PointerEvent): void => {
		const dpr = window.devicePixelRatio;
		const x = event.clientX;
		const y = event.clientY;
		const l = bounds.left;
		const t = bounds.top;
		const cr = target.clientWidth + l;
		const cb = target.clientHeight + t;
		const r = Math.min(bounds.right, cr) - dpr;
		const b = Math.min(bounds.bottom, cb) - dpr;
		const nextSpeedX = scrollHorizontal
			? x <= l
				? l - x < 100 / dpr
					? -lowSpeed
					: -highSpeed
				: x >= r
					? x - r < 100 / dpr
						? +lowSpeed
						: +highSpeed
					: 0
			: 0;
		const nextSpeedY = scrollVertical
			? y <= t
				? t - y < 100 / dpr
					? -lowSpeed
					: -highSpeed
				: y >= b
					? y - b < 100 / dpr
						? +lowSpeed
						: +highSpeed
					: 0
			: 0;
		if (nextSpeedX !== 0 || nextSpeedY !== 0) {
			if (speedX !== nextSpeedX || speedY !== nextSpeedY) {
				speedX = nextSpeedX;
				speedY = nextSpeedY;
				if (rafId === null) {
					lastTime = 0;
					rafId = requestAnimationFrame(step);
				}
			}
		} else if (speedX !== 0 || speedY !== 0) {
			speedX = 0;
			speedY = 0;
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		}
	};

	return {
		addScrollListener(mode: string, speed: number, shift: boolean, updater?: () => void): void {
			highSpeed = speed;
			lowSpeed = speed / 3;
			switch (mode) {
				case 'horizontal':
					scrollHorizontal = true;
					scrollVertical = false;
					break;
				case 'vertical':
					scrollHorizontal = false;
					scrollVertical = true;
					break;
			}
			scrollUpdater = updater ?? null;
			bounds = rect(target);
			window.addEventListener('pointermove', pointermove);
		},

		removeScrollListener(): void {
			speedX = 0;
			speedY = 0;
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			window.removeEventListener('pointermove', pointermove);
		}
	};
}
