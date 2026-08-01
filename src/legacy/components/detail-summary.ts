import { DetailBox } from './detail-box.ts';
import { on } from '@/util/element-utils.ts';

export class DetailSummary extends HTMLElement {
	constructor() {
		super();

		on(this, 'keydown', this.keydown as (event: EditorEvent) => void);
		on(this, 'pointerdown', this.pointerdown as (event: EditorEvent) => void);
	}

	toggle(): void {
		const parent = this.parentNode;
		if (parent instanceof DetailBox) {
			parent.toggle();
		}
	}

	keydown(event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey && !event.altKey) {
					this.toggle();
				}
				break;
		}
	}

	pointerdown(event: PointerEvent): void {
		switch (event.button) {
			case 0:
				if (event.target === this) {
					this.toggle();
				}
				break;
		}
	}
}

customElements.define('detail-summary', DetailSummary);
