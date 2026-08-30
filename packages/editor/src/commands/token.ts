import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import {
	setBooleanColor,
	setDelimiterColor,
	setOperatorColor
} from '@app/composables/useCommandColor.ts';

let _tokenMap: Record<string, string> | null = null;
function buildTokenMap(): Record<string, string> {
	return {
		'=': setOperatorColor('='),
		' = ': setOperatorColor(' = '),
		' / ': setOperatorColor(' / '),
		' <-> ': setOperatorColor(' <-> '),
		'>=': setOperatorColor('>='),
		'-': setOperatorColor('-'),
		'+': setOperatorColor('+'),
		'≤': setOperatorColor('≤'),
		'(': setDelimiterColor('('),
		')': setDelimiterColor(')'),
		'[': setDelimiterColor('['),
		']': setDelimiterColor(']'),
		'{': setDelimiterColor('{'),
		'}': setDelimiterColor('}'),
		'<': setDelimiterColor('<'),
		'>': setDelimiterColor('>'),
		'.': setDelimiterColor('.'),
		',': setDelimiterColor(','),
		', ': setDelimiterColor(', '),
		': ': setDelimiterColor(': '),
		' ~ ': setDelimiterColor(' ~ '),
		' x ': setDelimiterColor(' x '),
		' -> ': setDelimiterColor(' -> '),
		'...': setDelimiterColor('...'),
		get none() {
			return setBooleanColor(t('common.none'));
		},
		get null() {
			return setBooleanColor(t('common.null'));
		}
	};
}

export const Token = (key: string): string => {
	if (!_tokenMap) _tokenMap = buildTokenMap();
	return _tokenMap[key];
};
