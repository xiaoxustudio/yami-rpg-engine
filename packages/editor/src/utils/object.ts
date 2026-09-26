/**
 * 本文件过去**同时**导出朴素 `clone` 并把它挂到全局 `Object.clone`（另一份更稳健的实现）。
 * 现在只保留**一份**实现（原 `Object.clone` 那份：处理循环引用与"纯对象"判定），
 * 由调用点显式 import——不再给内置 `Object` 打补丁。
 */
const { isArray } = Array;

const isPlainObject = (value: unknown): boolean => {
	if (value === null || typeof value !== 'object') return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
};

const deepClone = <T>(object: T, seen: WeakMap<object, unknown>): T => {
	if (object === null || typeof object !== 'object') return object;
	if (seen.has(object as object)) {
		return seen.get(object as object) as T;
	}
	let copy: unknown[] | Record<PropertyKey, unknown>;
	if (isArray(object)) {
		const arr = object as unknown[];
		copy = Array.from({ length: arr.length });
		seen.set(object as object, copy);
		for (let i = 0; i < arr.length; i++) {
			const value = arr[i];
			(copy as unknown[])[i] = value instanceof Object ? deepClone(value, seen) : value;
		}
	} else if (isPlainObject(object)) {
		copy = {} as Record<PropertyKey, unknown>;
		seen.set(object as object, copy);
		for (const key in object as Record<string, unknown>) {
			const value = (object as Record<string, unknown>)[key];
			(copy as Record<string, unknown>)[key] =
				value instanceof Object ? deepClone(value, seen) : value;
		}
	} else {
		return object;
	}
	return copy as T;
};

/** 深拷贝（循环引用安全；只复制数组与**纯对象**，其余原样返回）。 */
export function clone<T>(object: T): T {
	return deepClone(object, new WeakMap());
}

export const empty: Record<string, never> = {};
