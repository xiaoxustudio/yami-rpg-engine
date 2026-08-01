import { DetailSummary } from './detail-summary.ts';
import { show, hide } from '@/util/element-utils.ts';

export class DetailBox extends HTMLElement {
	toggleEventEnabled: boolean;

	constructor() {
		super();

		this.toggleEventEnabled = false;
	}

	toggle(): void {
		if (this.hasAttribute('open')) {
			DetailBox.prototype.close.call(this);
		} else {
			DetailBox.prototype.open.call(this);
		}
	}

	open(): void {
		if (!this.hasAttribute('open')) {
			this.setAttribute('open', '');
			for (const node of this.children) {
				if (!(node instanceof DetailSummary)) {
					show(node as HTMLElement);
				}
			}
			if (this.toggleEventEnabled) {
				const toggle = new Event('toggle');
				toggle.value = 'open';
				this.dispatchEvent(toggle);
			}
		}
	}

	close(): void {
		if (this.hasAttribute('open')) {
			this.removeAttribute('open');
			for (const node of this.children) {
				if (!(node instanceof DetailSummary)) {
					hide(node as HTMLElement);
				}
			}
			if (this.toggleEventEnabled) {
				const toggle = new Event('toggle');
				toggle.value = 'closed';
				this.dispatchEvent(toggle);
			}
		}
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'toggle':
				this.toggleEventEnabled = true;
				break;
		}
	}
}

customElements.define('detail-box', DetailBox);
