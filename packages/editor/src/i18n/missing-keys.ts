/**
 * 运行期「静态 key 缺失」观测：只记录 `components.*` / `properties.*`。
 *
 * 为什么需要它：`scripts/i18n-key-guard.mjs` 只能扫**静态字面量** key ——
 * `t('components.' + name)`、模板字符串这类动态拼接它看不见（前缀以 `.` 结尾，自动跳过）。
 * 而动态 key 恰恰是最容易拼错的一类：拼错不会报错，`t()` 直接把 key 原样显示在界面上。
 *
 * 为什么只记录这两组命名空间：其余命名空间（`command.*` / `common.*` / `confirmation.*` …）
 * 并不是编辑器语言包提供的 —— 它们来自**工程模板**的本地化数据，运行期由工程侧注入。
 * 把它们算作缺失会制造大量假阳性，也会诱导后来者去"补齐"一份本就不该在编辑器里的文案。
 *
 * 记录落地在 `window.__I18N_MISSING__`（有上限，避免刷爆内存）：真机 E2E 在黄金路径跑完后
 * 断言它是空的；本地排查时也可以在 DevTools 里直接看。
 */

const GUARDED_NAMESPACES = ['components.', 'properties.'];
const MAX_RECORDS = 200;

const missing = new Set<string>();

/** `window` 上的观测出口（E2E 直接读它；不污染全局类型声明）。 */
type WindowWithMissingKeys = Window & { __I18N_MISSING__?: string[] };

function publish(): void {
	if (typeof window === 'undefined') return;
	(window as WindowWithMissingKeys).__I18N_MISSING__ = [...missing];
}

/** 记录一条缺失（同一 key 只记一次；非受管命名空间直接忽略）。 */
export function recordMissingKey(key: string): void {
	if (typeof key !== 'string' || !key.includes('.')) return;
	if (!GUARDED_NAMESPACES.some((namespace) => key.startsWith(namespace))) return;
	if (missing.size >= MAX_RECORDS) return;
	if (missing.has(key)) return;
	missing.add(key);
	publish();
}

/** 只读快照（测试与 E2E 用）。 */
export function getMissingKeys(): string[] {
	return [...missing];
}

/** 清空（测试用；真机流程不需要）。 */
export function resetMissingKeys(): void {
	missing.clear();
	publish();
}

publish();
