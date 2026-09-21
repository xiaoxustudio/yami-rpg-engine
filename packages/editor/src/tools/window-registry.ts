const windows = new Map<string, unknown>();
const pending = new Map<string, Promise<unknown>>();

/**
 * 吞掉「丢弃型」加载失败，避免**未处理的 rejection**。
 *
 * 为什么必须显式做这件事（2026-09-21 实测）：本文件的两处 `void ensure(...)` 是**故意**丢弃
 * 返回值的（它们的错误回调本来就什么都不做），但「丢弃派生 promise」与「处理原始 promise 的
 * rejection」是**两件事** —— 原始 promise 一旦 reject 而没人挂回调，Node 就把它记为
 * `unhandledRejection`，vitest 直接判**套件失败**（即便 2066 个用例全绿、`exit 1`）。
 *
 * 实测症状：`stores/__tests__/ui-state.spec.ts` 写 `store.zoom = 2` ⇒ 懒代理 `get`/`set`
 * trap 取不到实例 ⇒ 触发 `loadUI()` 动态 `import('window-cluster')` ⇒ 环境在 import 完成前
 * 拆除 ⇒ `EnvironmentTeardownError: Cannot load '…/useZoomWindow.ts' … after the environment
 * was torn down`，整个 `@yami/editor` 套件因此红。
 *
 * 注意与逻辑无关：handler 体是**空的**，这里只把「本来就是静默失败」这一既有语义写成显式代码，
 * 不改变任何成功路径，也不改变 `loadWindow()` 对**调用方**的返回行为（返回的仍是原 promise）。
 */
function ignoreUnhandledRejection(reason: unknown): void {
	void reason;
}

function ensure(name: string, loader: () => Promise<unknown>): Promise<unknown> {
	let promise = pending.get(name);
	if (!promise) {
		promise = loader().then((instance) => {
			windows.set(name, instance);
			return instance;
		});
		// 只挂「已处理」标记，不替换 pending 里的 promise ⇒ 调用方仍能照常拿到 rejection。
		// 失败后**保留**在 pending 里（不清缓存）：与改动前一致，避免 loader 反复失败时无限重试。
		void promise.catch(ignoreUnhandledRejection);
		pending.set(name, promise);
	}
	return promise;
}

export function getLazyWindow<T extends object>(name: string, loader: () => Promise<T>): T {
	const proxy = new Proxy({} as object, {
		get(_target: object, prop: string | symbol) {
			if (prop === 'then') return undefined;
			const instance = windows.get(name);
			if (instance === undefined) {
				void ensure(name, loader as () => Promise<unknown>);
				return undefined;
			}
			return (instance as Record<string, unknown>)[prop as string];
		},
		set(_target: object, prop: string | symbol, value: unknown) {
			const instance = windows.get(name);
			if (instance !== undefined) {
				(instance as Record<string, unknown>)[prop as string] = value;
				return true;
			}
			// 这条链会**派生第二个 promise**：`ensure()` 内部那层 catch 只标记了原 promise，
			// 派生出来的这个若无人处理，照样会变成 `unhandledRejection`。所以这里必须再挂一次。
			void ensure(name, loader as () => Promise<unknown>)
				.then((inst) => {
					(inst as Record<string, unknown>)[prop as string] = value;
				})
				.catch(ignoreUnhandledRejection);
			return true;
		},
		has() {
			return true;
		},
		ownKeys() {
			return [];
		},
		getOwnPropertyDescriptor() {
			return { configurable: true, enumerable: true };
		}
	}) as T;
	return proxy;
}

export function loadWindow<T>(name: string, loader: () => Promise<T>): Promise<T> {
	return ensure(name, loader as () => Promise<unknown>) as Promise<T>;
}

export function primeWindows(instances: Record<string, unknown>): void {
	for (const [key, value] of Object.entries(instances)) {
		if (value !== undefined) {
			const name = key.toLowerCase();
			windows.set(name, value);
			pending.set(name, Promise.resolve(value));
		}
	}
}
