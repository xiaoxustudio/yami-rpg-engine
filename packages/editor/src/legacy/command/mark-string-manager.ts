import { Command } from './command-object.ts';
import { t } from '@app/i18n';

let _tokenMap: Record<string, string> | null = null;
function buildTokenMap(): Record<string, string> {
	return {
		'=': Command.setOperatorColor('='),
		' = ': Command.setOperatorColor(' = '),
		' / ': Command.setOperatorColor(' / '),
		' <-> ': Command.setOperatorColor(' <-> '),
		'>=': Command.setOperatorColor('>='),
		'-': Command.setOperatorColor('-'),
		'+': Command.setOperatorColor('+'),
		'≤': Command.setOperatorColor('≤'),
		'(': Command.setDelimiterColor('('),
		')': Command.setDelimiterColor(')'),
		'[': Command.setDelimiterColor('['),
		']': Command.setDelimiterColor(']'),
		'{': Command.setDelimiterColor('{'),
		'}': Command.setDelimiterColor('}'),
		'<': Command.setDelimiterColor('<'),
		'>': Command.setDelimiterColor('>'),
		'.': Command.setDelimiterColor('.'),
		',': Command.setDelimiterColor(','),
		', ': Command.setDelimiterColor(', '),
		': ': Command.setDelimiterColor(': '),
		' ~ ': Command.setDelimiterColor(' ~ '),
		' x ': Command.setDelimiterColor(' x '),
		' -> ': Command.setDelimiterColor(' -> '),
		'...': Command.setDelimiterColor('...'),
		get none() {
			return Command.setBooleanColor(t('common.none'));
		},
		get null() {
			return Command.setBooleanColor(t('common.null'));
		}
	};
}

export const Token = (key: string): string => {
	if (!_tokenMap) _tokenMap = buildTokenMap();
	return _tokenMap[key];
};
