import { inject } from 'vue';
import { ThemeKey, defaultTheme } from '../theme/theme';
import type { Theme } from '../theme/theme';

export function useTheme(): Readonly<Theme> {
	return inject(ThemeKey, defaultTheme);
}
