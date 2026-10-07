export function lazyCjs<T>(load: () => Promise<unknown>): () => Promise<T> {
	let cached: Promise<T> | null = null;
	return () => {
		cached ??= load().then((module) => (module as { default: T }).default);
		return cached;
	};
}
