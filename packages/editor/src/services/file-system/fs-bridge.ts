import nodeFs from 'node:fs';
import type { Dirent } from 'node:fs';
import { YamiIpc } from '@app/services/ipc/bridge.ts';

export const FS = nodeFs;

export type FSPShape = Omit<typeof FS.promises, 'writeFile' | 'readdir'> & {
	/**
	 * `readdir` 只保留**本仓实际用到**的两支重载，且把 `withFileTypes` 那支放在**最后**
	 * （node 的类型里最后一支是 `encoding: 'buffer'`：元素类型 `Dirent<Buffer>`、`name` 是 Buffer，
	 * 而本仓七处调用一律走默认 utf8 ⇒ `name` 是 `string`）。
	 * 「取函数类型」的地方（如测试里的 `mockResolvedValue`）取的是**最后一个签名** ——
	 * 留全四支就会要求 `Dirent<Buffer>`，与运行期不符，只能再写一次断言。
	 */
	readdir(path: string): Promise<string[]>;
	readdir(path: string, options: { withFileTypes: true }): Promise<Dirent[]>;
	writeFile(path: string, text: string | Uint8Array, check?: boolean): Promise<unknown>;
};

export const FSP: FSPShape = Object.assign(FS.promises, {
	writeFile: (path: string, text: string | Uint8Array, check = false) =>
		YamiIpc.invoke.writeFile(path, text, check)
});
