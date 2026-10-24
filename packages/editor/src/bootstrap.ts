import { markBoot } from '@app/utils/boot-timeline';

let resolveCriticalReady: (() => void) | undefined;
let resolveLazyReady: (() => void) | undefined;
let resolveWorkspace: (() => void) | undefined;
let resolveEditorDomains: (() => void) | undefined;

export const criticalComponentsReady: Promise<void> = new Promise((resolve) => {
	resolveCriticalReady = resolve;
});

export const lazyComponentsReady: Promise<void> = new Promise((resolve) => {
	resolveLazyReady = resolve;
});

export const workspaceActivation: Promise<void> = new Promise((resolve) => {
	resolveWorkspace = resolve;
});

export const editorDomainsReady: Promise<void> = new Promise((resolve) => {
	resolveEditorDomains = resolve;
});

export function activateWorkspace(): void {
	resolveWorkspace?.();
	resolveWorkspace = undefined;
	markBoot('workspace-activated');
}

export function resolveCriticalComponentsReady(): void {
	resolveCriticalReady?.();
	resolveCriticalReady = undefined;
	markBoot('critical-ready');
}

export function resolveLazyComponentsReady(): void {
	resolveLazyReady?.();
	resolveLazyReady = undefined;
	markBoot('lazy-ready');
}

export function resolveEditorDomainsReady(): void {
	resolveEditorDomains?.();
	resolveEditorDomains = undefined;
	markBoot('editor-domains-ready');
}
