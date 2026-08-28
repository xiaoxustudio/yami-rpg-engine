declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
	export default component;
}

declare module '*?worker' {
	const workerConstructor: new () => Worker;
	export default workerConstructor;
}

declare module 'monaco-editor/esm/vs/editor/editor.all';

declare module 'monaco-editor/esm/vs/basic-languages/*';
