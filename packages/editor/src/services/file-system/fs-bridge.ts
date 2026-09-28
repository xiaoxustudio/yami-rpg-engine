import nodeFs from 'node:fs';
import type { Dirent } from 'node:fs';
import { YamiIpc } from '@app/services/ipc/bridge.ts';

export const FS = nodeFs;

/**
 * `fs.promises` 的 IPC 代理：**就是 `fs.promises` 本体**，只把 `writeFile` 换成走 IPC 的实现。
 *
 * 对外面 = 「`fs.promises` 的其余成员」+「被覆盖的 `writeFile`」。两处差别必须写明，否则会重演旧事故：
 *
 * 1. **`writeFile` 是语义不兼容的覆盖**：node 的第三参是 `options: ObjectEncodingOptions |
 *    BufferEncoding | null`，这里换成了**布尔 `check`**（存在性预检，见 `main/ipc-handlers.ts`
 *    的 `if (check) await FSP.stat(filePath)`）。类型写出来之后，调用点再传 `{}` 这类
 *    「碰巧真值」的第三参就会在编译期露出来（已就地改成 `true`，语义不变）。
 * 2. **`fs.promises` 上没有的成员不再被静默放过**：`FileBrowser.vue` 曾写
 *    `existsSync: (p) => FSP.existsSync(p)`，而同步的 `existsSync` 只在 `fs` 上
 *    （`fs.promises` 只有异步 `access`）⇒ 调用即 `TypeError`，一路让重命名文件直接抛错。
 *    先前的 `Record<string, any>` 正好把这条差别藏住了；现在写错成员名即编译期报错。
 */
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
