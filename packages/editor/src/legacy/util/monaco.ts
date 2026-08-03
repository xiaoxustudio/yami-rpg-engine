let monacoPromise: Promise<typeof import('monaco-editor')> | undefined;

export function getMonaco(): Promise<typeof import('monaco-editor')> {
	return (monacoPromise ??= import('monaco-editor'));
}
