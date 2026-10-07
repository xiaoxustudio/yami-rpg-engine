import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../dom';

describe('escapeHtml', () => {
	it('转义 HTML 元字符', () => {
		expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
			'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
		);
	});

	it('`&` 最先替换，已生成的实体不会被二次转义', () => {
		expect(escapeHtml('a & b')).toBe('a &amp; b');
		expect(escapeHtml('&lt;')).toBe('&amp;lt;');
	});

	it('单引号也转义', () => {
		expect(escapeHtml("it's")).toBe('it&#39;s');
	});

	it('纯文本原样保留', () => {
		expect(escapeHtml('No data')).toBe('No data');
		expect(escapeHtml('')).toBe('');
	});
});
