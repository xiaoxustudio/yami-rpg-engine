import { describe, expect, it } from 'vitest';
import { getElementApi } from '../../../../utils/element-apis';
import { createDetailBoxElement } from '../detail-box-api';
import type { DetailBoxApi } from '../detail-box-api';
import { createDetailSummaryElement } from '../../YMDetailSummary/detail-summary-api';
import type { DetailSummaryApi } from '../../YMDetailSummary/detail-summary-api';

describe('createDetailBoxElement', () => {
	it('creates open detail-box', () => {
		const el = createDetailBoxElement() as unknown as DetailBoxApi;
		expect(el.classList.contains('detail-box')).toBe(true);
		expect(el.hasAttribute('open')).toBe(true);
		// 方法只在旁表里：元素上不再挂
		expect(typeof (el as unknown as { open?: unknown }).open).toBe('undefined');
		const api = getElementApi<{ open(): void; close(): void }>(el)!;
		expect(typeof api.open).toBe('function');
		expect(typeof api.close).toBe('function');
		expect(typeof getElementApi<{ toggle?: unknown }>(el)?.toggle).toBe('function');
	});

	it('close hides non-summary children', () => {
		const el = createDetailBoxElement() as unknown as DetailBoxApi;
		const content = document.createElement('div');
		el.appendChild(content);
		getElementApi<{ close(): void }>(el)!.close();
		expect(content.classList.contains('hidden')).toBe(true);
		getElementApi<{ open(): void }>(el)!.open();
		expect(content.classList.contains('hidden')).toBe(false);
	});

	it('summary toggle works with detail-box', () => {
		const box = createDetailBoxElement() as unknown as DetailBoxApi;
		const summary = createDetailSummaryElement() as unknown as DetailSummaryApi;
		box.appendChild(summary);
		const content = document.createElement('div');
		box.appendChild(content);
		getElementApi<{ toggle(): void }>(summary)!.toggle();
		expect(box.hasAttribute('open')).toBe(false);
		getElementApi<{ toggle(): void }>(summary)!.toggle();
		expect(box.hasAttribute('open')).toBe(true);
	});
});

describe('createDetailSummaryElement', () => {
	it('creates detail-summary', () => {
		const el = createDetailSummaryElement() as unknown as DetailSummaryApi;
		expect(el.classList.contains('detail-summary')).toBe(true);
		expect(typeof getElementApi<{ toggle?: unknown }>(el)?.toggle).toBe('function');
	});
});
