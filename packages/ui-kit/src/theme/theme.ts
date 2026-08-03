import type { InjectionKey } from 'vue';

export interface Theme {
	primary: string;
	primaryHover: string;
	onPrimary: string;
	danger: string;
	dangerHover: string;
	surface: string;
	surfaceHover: string;
	border: string;
	text: string;
	radiusSm: string;
	radiusMd: string;
	space1: string;
	space2: string;
	space3: string;
	space4: string;
	space6: string;
	fontSans: string;
	fontMono: string;
	fontSizeSm: string;
	fontSizeMd: string;
	fontSizeLg: string;
}

export const ThemeKey: InjectionKey<Readonly<Theme>> = Symbol('ui-kit-theme');

export const defaultTheme: Theme = {
	primary: 'var(--ui-color-primary)',
	primaryHover: 'var(--ui-color-primary-hover)',
	onPrimary: 'var(--ui-color-on-primary)',
	danger: 'var(--ui-color-danger)',
	dangerHover: 'var(--ui-color-danger-hover)',
	surface: 'var(--ui-color-surface)',
	surfaceHover: 'var(--ui-color-surface-hover)',
	border: 'var(--ui-color-border)',
	text: 'var(--ui-color-text)',
	radiusSm: 'var(--ui-radius-sm)',
	radiusMd: 'var(--ui-radius-md)',
	space1: 'var(--ui-space-1)',
	space2: 'var(--ui-space-2)',
	space3: 'var(--ui-space-3)',
	space4: 'var(--ui-space-4)',
	space6: 'var(--ui-space-6)',
	fontSans: 'var(--ui-font-sans)',
	fontMono: 'var(--ui-font-mono)',
	fontSizeSm: 'var(--ui-font-size-sm)',
	fontSizeMd: 'var(--ui-font-size-md)',
	fontSizeLg: 'var(--ui-font-size-lg)'
};
