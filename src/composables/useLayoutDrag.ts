export function useLayoutDrag() {
	const getLayout = () => {
		if (typeof window === 'undefined') return undefined;
		return (window as any).Layout;
	};

	function onNavDragstart(event: any) {
		getLayout()?.navDragstart?.(event);
	}

	function onNavDragend(event: any) {
		getLayout()?.navDragend?.(event);
	}

	function onNavDragenter(event: any) {
		getLayout()?.navDragenter?.(event);
	}

	function onNavDragleave(event: any) {
		getLayout()?.navDragleave?.(event);
	}

	function onNavDragover(event: any) {
		getLayout()?.navDragover?.(event);
	}

	function onNavDrop(event: any) {
		getLayout()?.navDrop?.(event);
	}

	function onRegionDragleave(event: any) {
		getLayout()?.regionDragleave?.(event);
	}

	function onRegionDragover(event: any) {
		getLayout()?.regionDragover?.(event);
	}

	function onBorderPointerdown(event: any) {
		getLayout()?.borderPointerdown?.(event);
	}

	function onPointerup(event: any) {
		getLayout()?.pointerup?.(event);
	}

	function onPointermove(event: any) {
		getLayout()?.pointermove?.(event);
	}

	function onNavPointerdown(event: any) {
		getLayout()?.navPointerdown?.(event);
	}

	function onNavWrite(event: any) {
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
