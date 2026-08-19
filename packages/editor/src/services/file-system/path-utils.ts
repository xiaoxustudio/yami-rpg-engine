import { Path } from '@app/utils/config';

// 转换至斜杠分隔符；PlatformPath 是 interface，直接赋值 TS 不识别扩展，用 Object.assign 触发 type-safe 静态属性赋值
Object.assign(Path, {
	slash: (function IIFE() {
		const regexp = /\\/g;
		return function (path: string) {
			if (path.indexOf('\\') !== -1) {
				path = path.replace(regexp, '/');
			}
			return path;
		};
	})()
});

export function parseGUID(filename: string): string {
	const match = filename.match(/(?<=\.)[0-9a-f]{16}(?=\.\S+$)/);
	return match ? match[0] : '';
}

export function filterGUID(filename: string): string {
	return filename.replace(/\.[0-9a-f]{16}(?=\.\S+$)/, '');
}

export function parseFileSize(size: number): string {
	let string;
	let unit;
	if (size < 1000) {
		unit = size === 1 ? 'byte' : 'bytes';
	} else {
		size /= 1024;
		if (size < 1000) {
			unit = 'KB';
		} else {
			size /= 1024;
			if (size < 1000) {
				unit = 'MB';
			} else {
				size /= 1024;
				unit = 'GB';
			}
		}
	}
	switch (unit) {
		case 'byte':
		case 'bytes':
			string = size.toString();
			break;
		default:
			if (size < 10) {
				string = size.toFixed(2);
			} else if (size < 100) {
				string = size.toFixed(1);
			} else {
				string = size.toFixed(0);
			}
			break;
	}
	return `${string}${unit}`;
}
