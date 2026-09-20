import nodeFs from 'node:fs';
import { YamiIpc } from '@app/services/ipc/bridge.ts';

export const FS = nodeFs;

/**
 * `fs.promises` 的 IPC 代理：**就是 `fs.promises` 本体**，只把 `writeFile` 换成走 IPC 的实现。
 *
 * ## ⚠️ 这里的 `Record<string, any>` 是**承重**的，别顺手删（2026-09-20 实测过）
 *
 * 它掩盖过两个真实差别，两者都不是「补个类型名」就能解决的：
 *
 * 1. **`writeFile` 是语义不兼容的覆盖**：node 的第三参是 `options: ObjectEncodingOptions |
 *    BufferEncoding | null`，而这里换成了**布尔 `check`**（存在性预检，见 `main/ipc-handlers.ts`
 *    的 `if (check) await FSP.stat(filePath)`）。想收紧就必须先把「`FSP.writeFile` 到底接受什么」
 *    定下来，并同步改约 30 个调用点（`FSP.writeFile(path, json, true)`、
 *    `FSP.writeFile!(pConfig, …, {})` 这些形态在调用侧并不统一）。
 * 2. **`fs.promises` 上没有的成员也曾被静默放过** —— 实测踩中一次：
 *    `FileBrowser.vue` 曾写 `existsSync: (p) => FSP.existsSync(p)`，而 `fs.promises.existsSync`
 *    是 `undefined`（同步的 `existsSync` 只在 `fs` 上，`fs.promises` 只有异步 `access`）。
 *    ⇒ 调用即 `TypeError`，一路让**文件浏览器里重命名文件直接抛错**。
 *    已修正为 `FS.existsSync`（见该处注释）。
 *
 * ⇒ 收这条轴的正确做法是**先定义 `FSP` 的对外面**（哪些成员、各自什么签名），
 * 再逐个改调用点。在那之前 `any` 至少让两种差别保持在「可见的注释」里，
 * 而不是换成一个更窄但**不成立**的类型（那会把差别藏得更深）。
 */
// oxlint-disable-next-line no-explicit-any
export const FSP = (FS.promises ?? {}) as Record<string, any>;

FSP.writeFile = function (path: string, text: string | Buffer, check = false) {
	return YamiIpc.invoke.writeFile(path, text, check);
};
