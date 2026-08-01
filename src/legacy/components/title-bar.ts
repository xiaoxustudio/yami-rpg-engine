import { on, off, hasClass, rect } from '@/util/element-utils.ts';

function getWindow() {
	return (window as any).Window;
}

export class TitleBar extends HTMLElement {
	dragging: PointerEvent | null;

	constructor() {
		super();

		this.dragging = null;

		on(this, 'pointerdown', this.pointerdown as (event: EditorEvent) => void);
		on(this, 'click', this.mouseclick);
		on(this, 'doubleclick', this.doubleclick);
	}

	pointerdown(event: PointerEvent): void {
		if (this.dragging) {
			return;
		}
		switch (event.button) {
			case 0:
				if (event.target instanceof TitleBar) {
					const windowFrame = this.parentNode as HTMLElement & {
						rect(): DOMRect;
						maximize(): void;
						unmaximize(): void;
						style: CSSStyleDeclaration;
						id: string;
					};
					const { left, top, width, height } = rect(windowFrame);
					const startX = event.clientX;
					const startY = event.clientY;
					const pointermove = (event: PointerEvent) => {
						if ((this.dragging as PointerEvent).relate(event)) {
							let right = window.innerWidth - width;
							let bottom = window.innerHeight - height;
							if (hasClass(document.body, 'border')) {
								const dpx = 1 / window.devicePixelRatio;
								right -= dpx * 2;
								bottom -= dpx * 2;
							}
							const x = CSS.rasterize(left - startX + event.clientX);
							const y = CSS.rasterize(top - startY + event.clientY);
							windowFrame.style.left = `${Math.clamp(x, 0, right)}px`;
							windowFrame.style.top = `${Math.clamp(y, 0, bottom)}px`;
						}
					};
					const pointerup = (event: PointerEvent) => {
						if ((this.dragging as PointerEvent).relate(event)) {
							cancel();
						}
					};
					const cancel = (event?: Event) => {
						this.dragging = null;
						off(
							window as any,
							'pointermove',
							pointermove as (event: EditorEvent) => void
						);
						off(window as any, 'pointerup', pointerup as (event: EditorEvent) => void);
						off(window as any, 'blur', cancel as (event: EditorEvent) => void);
					};
					this.dragging = event;
					(event as PointerEvent & { cancel(event?: Event): void }).cancel = cancel;
					on(window as any, 'pointermove', pointermove as (event: EditorEvent) => void);
					on(window as any, 'pointerup', pointerup as (event: EditorEvent) => void);
					on(window as any, 'blur', cancel as (event: EditorEvent) => void);
				}
				break;
		}
	}

	mouseclick(event: Event): void {
		const target = event.target as HTMLElement;
		switch (target.tagName) {
			case 'MAXIMIZE': {
				const windowFrame = this.parentNode as HTMLElement & {
					hasClass(name: string): boolean;
					maximize(): void;
					unmaximize(): void;
					id: string;
				};
				if (!hasClass(windowFrame, 'maximized')) {
					windowFrame.maximize();
				} else {
					windowFrame.unmaximize();
				}
				break;
			}
			case 'CLOSE': {
				const windowFrame = this.parentNode as HTMLElement & {
					id: string;
				};
				getWindow().close(windowFrame.id);
				break;
			}
		}
	}

	doubleclick(event: Event): void {
		const target = event.target as HTMLElement;
		if (target instanceof TitleBar && target.querySelector('maximize')) {
			(this.dragging as (PointerEvent & { cancel(): void }) | null)?.cancel();
			const windowFrame = this.parentNode as HTMLElement & {
				hasClass(name: string): boolean;
				maximize(): void;
				unmaximize(): void;
			};
			if (!hasClass(windowFrame, 'maximized')) {
				windowFrame.maximize();
			} else {
				windowFrame.unmaximize();
			}
		}
	}
}

customElements.define('title-bar', TitleBar);
