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
	primary: 'var(--ym-color-primary)',
	primaryHover: 'var(--ym-color-primary-hover)',
	onPrimary: 'var(--ym-color-on-primary)',
	danger: 'var(--ym-color-danger)',
	dangerHover: 'var(--ym-color-danger-hover)',
	surface: 'var(--ym-color-surface)',
	surfaceHover: 'var(--ym-color-surface-hover)',
	border: 'var(--ym-color-border)',
	text: 'var(--ym-color-text)',
	radiusSm: 'var(--ym-radius-sm)',
	radiusMd: 'var(--ym-radius-md)',
	space1: 'var(--ym-space-1)',
	space2: 'var(--ym-space-2)',
	space3: 'var(--ym-space-3)',
	space4: 'var(--ym-space-4)',
	space6: 'var(--ym-space-6)',
	fontSans: 'var(--ym-font-sans)',
	fontMono: 'var(--ym-font-mono)',
	fontSizeSm: 'var(--ym-font-size-sm)',
	fontSizeMd: 'var(--ym-font-size-md)',
	fontSizeLg: 'var(--ym-font-size-lg)'
};
