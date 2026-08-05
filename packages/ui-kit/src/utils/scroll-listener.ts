export interface ScrollListenerApi {
	add(
		target: HTMLElement,
		mode: string,
		speed: number,
		shift: boolean,
		updater?: () => void
	): void;
	remove(target: HTMLElement): void;
}

export function createScrollListener(): ScrollListenerApi {
	let target: HTMLElement | null = null;
	let highSpeed = 0;
	let lowSpeed = 0;
	let scrollHorizontal = false;
	let scrollVertical = false;
	let scrollUpdater: (() => void) | null = null;
	let rafId: number | null = null;
	let lastTime = 0;

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

	const scroll = (el: HTMLElement, speedX: number, speedY: number, deltaTime: number): void => {
		const { scrollLeft, scrollTop } = el;
		if (speedX !== 0) {
			el.scrollLeft += computeScrollDelta(speedX, deltaTime);
		}
		if (speedY !== 0) {
			el.scrollTop += computeScrollDelta(speedY, deltaTime);
		}
		if (el.scrollLeft !== scrollLeft || el.scrollTop !== scrollTop) {
			scrollUpdater?.();
		}
	};

	const tick = (time: number): void => {
		const deltaTime = Math.min(time - lastTime, 35);
		lastTime = time;
		if (target) {
			scroll(target, timer.speedX, timer.speedY, deltaTime);
		}
		if (timer.speedX !== 0 || timer.speedY !== 0) {
			rafId = requestAnimationFrame(tick);
		} else {
			rafId = null;
		}
	};

	const timer = {
		speedX: 0,
		speedY: 0,
		add(): void {
			if (rafId === null) {
				lastTime = performance.now();
				rafId = requestAnimationFrame(tick);
			}
		},
		remove(): void {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		}
	};

	const pointermove = (event: PointerEvent): void => {
		if (!target) return;
		const dpr = window.devicePixelRatio;
		const bounds = target.getBoundingClientRect();
		const x = event.clientX;
		const y = event.clientY;
		const l = bounds.left;
		const t = bounds.top;
		const cr = target.clientWidth + l;
		const cb = target.clientHeight + t;
		const r = Math.min(bounds.right, cr) - dpr;
		const b = Math.min(bounds.bottom, cb) - dpr;
		const scrollSpeedX = scrollHorizontal
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
		const scrollSpeedY = scrollVertical
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
		if (scrollSpeedX !== 0 || scrollSpeedY !== 0) {
			if (timer.speedX !== scrollSpeedX || timer.speedY !== scrollSpeedY) {
				timer.speedX = scrollSpeedX;
				timer.speedY = scrollSpeedY;
				timer.add();
			}
		} else if (timer.speedX !== 0 || timer.speedY !== 0) {
			timer.speedX = 0;
			timer.speedY = 0;
			timer.remove();
		}
	};

	const api: ScrollListenerApi = {
		add(targetEl, mode, speed, shift, updater) {
			if (target) {
				api.remove(target);
			}
			target = targetEl;
			scrollHorizontal = mode === 'horizontal' || mode === 'both';
			scrollVertical = mode === 'vertical' || mode === 'both';
			highSpeed = speed;
			lowSpeed = shift ? speed / 4 : speed;
			scrollUpdater = updater ?? (() => {});
			window.addEventListener('pointermove', pointermove);
		},
		remove(targetEl) {
			if (target !== targetEl) return;
			if (timer.speedX || timer.speedY) {
				timer.speedX = 0;
				timer.speedY = 0;
				timer.remove();
			}
			target = null;
			scrollUpdater = null;
			window.removeEventListener('pointermove', pointermove);
		}
	};
	return api;
}
