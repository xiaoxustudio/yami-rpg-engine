export function computeIndexDigits(length: number): number {
	return Math.floor(Math.log10(Math.max(length - 1, 1))) + 1;
}

export function padZero(number: number, length: number, padString = '0'): string {
	const digits = computeIndexDigits(length);
	return number.toString().padStart(digits, padString);
}
