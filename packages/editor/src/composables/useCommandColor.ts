import { Token } from '@app/legacy/command/mark-string-manager.ts';

export function setNormalColor(value: string): string {
	return `$_normal_$${value}$_/_$`;
}

export function setVariableColor(value: string): string {
	return `$_identifier_$${value}$_/_$`;
}

export function setGlobalVariableColor(value: string): string {
	return `$_global-var_$${value}$_/_$`;
}

export function setDelimiterColor(value: string): string {
	return `$_delimiter_$${value}$_/_$`;
}

export function setOperatorColor(value: string): string {
	return `$_operator_$${value}$_/_$`;
}

export function setBooleanColor(value: string): string {
	return `$_boolean_$${value}$_/_$`;
}

export function setNumberColor(value: number | string): string {
	let v: string;
	if (typeof value === 'number') {
		v = value.toString();
	} else {
		v = value;
	}
	if (v[0] !== '-') return `$_number_$${v}$_/_$`;
	return Token('-') + `$_number_$${v.slice(1)}$_/_$`;
}

export function setStringColor(value: string, save: boolean = false): string {
	if (save === false) return `$_string_$${value}$_/_$`;
	return `$_string_$$_none_$$_/_$$_save_$$_none_$$_/_$${value}$_normal_$$_none_$$_/_$$_save_$$_none_$$_/_$`;
}

export function setScriptColor(value: string): string {
	return `$_text_$${value}$_/_$`;
}

export function setFileColor(value: string): string {
	return `$_file_$${value}$_/_$`;
}

export function setPresetColor(value: string): string {
	return `$_preset_$${value}$_/_$`;
}

export function setWeakColor(value: string): string {
	return `$_weak_$${value}$_/_$`;
}

export const setCommaColors = (function IIFE() {
	const regexp = /,/g;
	return function (value: string): string {
		return value.replace(regexp, '$_delimiter_$,$_/_$');
	};
})();

export function setTextId(id: string): string {
	return `$_textId_$${id}$_/_$`;
}

export function setTooltip(tip: string): string {
	return `$_tooltip_$${tip}$_/_$`;
}

export function setClass(className: string): string {
	return `$_class_$${className}$_/_$`;
}
