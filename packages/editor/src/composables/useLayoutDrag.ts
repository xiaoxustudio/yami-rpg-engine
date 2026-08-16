import { Layout } from '@app/engine/layout/layout.ts';
export function useLayoutDrag() {
	const getLayout = () => {
		if (typeof window === 'undefined') return undefined;
		return Layout;
	};

	function onNavDragstart(event: DragEvent) {
		getLayout()?.navDragstart?.(event);
	}

	function onNavDragend(event: Event) {
		getLayout()?.navDragend?.(event);
	}

	function onNavDragenter(event: DragEvent) {
		getLayout()?.navDragenter?.(event);
	}

	function onNavDragleave(event: Event) {
		getLayout()?.navDragleave?.(event);
	}

	function onNavDragover(event: DragEvent) {
		getLayout()?.navDragover?.(event);
	}

	function onNavDrop(event: Event) {
		getLayout()?.navDrop?.(event);
	}

	function onRegionDragleave(event: Event) {
		getLayout()?.regionDragleave?.(event);
	}

	function onRegionDragover(event: DragEvent) {
		getLayout()?.regionDragover?.(event);
	}

	function onBorderPointerdown(event: Event) {
		getLayout()?.borderPointerdown?.(event);
	}

	function onPointerup(event: Event) {
		getLayout()?.pointerup?.(event);
	}

	function onPointermove(event: Event) {
		getLayout()?.pointermove?.(event);
	}

	function onNavPointerdown(event: Event) {
		getLayout()?.navPointerdown?.(event);
	}

	function onNavWrite(event: Event) {
		getLayout()?.navWrite?.(event);
	}

	return {
		onNavDragstart,
		onNavDragend,
		onNavDragenter,
		onNavDragleave,
		onNavDragover,
		onNavDrop,
		onRegionDragleave,
		onRegionDragover,
		onBorderPointerdown,
		onPointerup,
		onPointermove,
		onNavPointerdown,
		onNavWrite
	};
}
