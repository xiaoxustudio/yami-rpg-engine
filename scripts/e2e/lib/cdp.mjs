/**
 * 最小 CDP 客户端（零依赖）。
 *
 * 为什么不引 Playwright：见 CONTRIBUTING「端到端（E2E）与截图对比：当前不进 CI」——
 * 本机与 CI 都没有 `@playwright/test` 与浏览器二进制，装上装不上不由本仓控制。
 * 但 Electron 本身就是 devDependency、`pnpm install` 时二进制已落盘，
 * 所以「真机启动 + CDP 驱动」这条路不需要任何额外二进制 —— 本项目用它。
 *
 * 与 `scripts/smoke-layout.mjs` 的关系：那边是**人工**驱动的真机冒烟（要求 app 已启动、
 * home 里刚好有最近项目）；这里把启动、隔离 HOME、等待与断言都自动化，供 CI 使用。
 * 两边的 CDP 调用方式保持一致，便于互相抄排查手法。
 *
 * ⚠️ 本目录在 `.oxlintrc.json` 里关掉了 `eslint/no-await-in-loop`（理由必须写在这里，
 *    因为 JSON 配置不接受注释）：E2E 的每一步都必须**等上一步真正生效**才能继续 ——
 *    轮询等待、逐个开窗口、逐个断言都是顺序语义，改成 `Promise.all` 会直接测出错误结果。
 *    这与 `scripts/smoke-layout.mjs` 的既有豁免是同一个理由。
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 等一个 TCP 端口上的 CDP 端点就绪，并返回渲染进程的 page target。 */
export async function waitForPageTarget(port, timeoutMs = 60000) {
	const deadline = Date.now() + timeoutMs;
	let lastError = null;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(`http://127.0.0.1:${port}/json/list`);
			const targets = await response.json();
			const page = targets.find(
				(target) => target.type === 'page' && target.webSocketDebuggerUrl
			);
			if (page) return page;
		} catch (error) {
			lastError = error;
		}
		await sleep(250);
	}
	throw new Error(
		`CDP 端口 ${port} 在 ${timeoutMs}ms 内没有出现 page target` +
			(lastError ? `（最后一次错误：${lastError.message}）` : '')
	);
}

/**
 * 连接 page target。
 * 所有等待都走 Node 侧轮询：Chromium 会节流隐藏窗口里的 setTimeout，
 * 页内轮询会假超时（smoke-layout.mjs 2026-09-09 踩过）。
 */
export async function connect(port, { timeoutMs = 60000 } = {}) {
	const page = await waitForPageTarget(port, timeoutMs);
	const socket = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.addEventListener('open', resolve, { once: true });
		socket.addEventListener('error', () => reject(new Error('CDP WebSocket 连接失败')), {
			once: true
		});
	});

	let sequence = 0;
	const pending = new Map();
	/** `console.error(...)` 写的日志：可能是应用**有意**记录的（try/catch 之后打一行）。 */
	const consoleErrors = [];
	/** 真正没被接住的异常（`Runtime.exceptionThrown`）—— 这类才是崩溃信号。 */
	const exceptions = [];

	socket.addEventListener('message', (event) => {
		let message;
		try {
			message = JSON.parse(event.data);
		} catch {
			return;
		}
		if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
			consoleErrors.push(
				(message.params.args ?? [])
					.map((arg) => arg.description ?? arg.value ?? arg.type)
					.join(' ')
			);
		}
		if (message.method === 'Runtime.exceptionThrown') {
			const details = message.params.exceptionDetails;
			exceptions.push(details.exception?.description ?? details.text ?? 'unknown exception');
		}
		const waiter = message.id ? pending.get(message.id) : undefined;
		if (!waiter) return;
		pending.delete(message.id);
		clearTimeout(waiter.timer);
		if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
		else waiter.resolve(message.result);
	});

	const send = (method, params = {}, commandTimeoutMs = 30000) =>
		new Promise((resolve, reject) => {
			const id = ++sequence;
			const timer = setTimeout(() => {
				if (!pending.has(id)) return;
				pending.delete(id);
				reject(new Error(`CDP ${method} 超过 ${commandTimeoutMs}ms 未回包`));
			}, commandTimeoutMs);
			pending.set(id, { resolve, reject, timer });
			socket.send(JSON.stringify({ id, method, params }));
		});

	/** 页面内求值；异常直接抛出（CLI 里能看到页面侧堆栈）。 */
	const evaluate = async (expression) => {
		const result = await send('Runtime.evaluate', {
			expression,
			returnByValue: true,
			awaitPromise: true
		});
		if (result.exceptionDetails) {
			throw new Error(
				'页面内求值失败：' +
					(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
			);
		}
		return result.result?.value;
	};

	/** 轮询页面内表达式直到返回真值（返回该值），超时返回 false。 */
	const waitFor = async (
		expression,
		{ timeoutMs: waitTimeoutMs = 15000, intervalMs = 250 } = {}
	) => {
		const deadline = Date.now() + waitTimeoutMs;
		for (;;) {
			const value = await evaluate(expression).catch(() => undefined);
			if (value) return value;
			if (Date.now() >= deadline) return false;
			await sleep(intervalMs);
		}
	};

	const close = () => {
		for (const waiter of pending.values()) clearTimeout(waiter.timer);
		pending.clear();
		socket.close();
	};

	await send('Runtime.enable');
	return { send, evaluate, waitFor, close, consoleErrors, exceptions, page };
}

export { sleep };
