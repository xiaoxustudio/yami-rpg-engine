export const compress = (function IIFE() {
	const whitespace = /\s+/g;
	return (string: string): string => {
		return string.replace(whitespace, '');
	};
})();
