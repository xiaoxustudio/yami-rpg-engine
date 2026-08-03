import { describe, expect, it } from 'vitest';
import { defaultTheme } from './theme';

describe('theme tokens', () => {
	it('all token references use --ym- prefix', () => {
		for (const [key, value] of Object.entries(defaultTheme)) {
			expect(value.startsWith('var(--ym-'), `theme.${key}`).toBe(true);
		}
	});

	it('contains no stale --ui- prefix', () => {
		const values = Object.values(defaultTheme).join(' ');
		expect(values.includes('--ui-')).toBe(false);
	});
});
