<template>
	<div class="nav-bar" ref="root" :id="props.id">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { addClass, removeClass, hasClass } from '@/util/element-utils.ts';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLElement | null>(null);

let writeEventEnabled = false;
let selectEventEnabled = false;

const read = (): any => {
	const element = root.value;
	if (!element) {
		return undefined;
	}
	const item = element.querySelector('.selected') as (HTMLElement & { dataValue: any }) | null;
	if (item && item.dataValue === undefined && hasClass(item, 'nav-item')) {
		const string = item.getAttribute('value') ?? '';
		const isNumber = RegExp.number.test(string);
		item.dataValue = isNumber ? parseFloat(string) : string;
	}
	return item ? item.dataValue : undefined;
};

const unselect = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const item = element.querySelector('.selected');
	if (item) {
		removeClass(item as HTMLElement, 'selected');
	}
};

const write = (value: any): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const items = element.children;
	const length = items.length;
	if (length !== 0) {
		unselect();
		let target: HTMLElement | undefined;
		for (let i = 0; i < length; i++) {
			const item = items[i] as HTMLElement & { dataValue: any };
			if (hasClass(item, 'nav-item') && item.dataValue === undefined) {
				const string = item.getAttribute('value') ?? '';
				const isNumber = RegExp.number.test(string);
				item.dataValue = isNumber ? parseFloat(string) : string;
			}
			if (item.dataValue === value) {
				target = item;
				break;
			}
		}
		if (target !== undefined) {
			addClass(target, 'selected');
		}
		if (writeEventEnabled) {
			const writeEvent: any = new Event('write');
			writeEvent.value = target ? value : undefined;
			element.dispatchEvent(writeEvent);
		}
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	element.addEventListener(type, listener, options);
	switch (type) {
		case 'write':
			writeEventEnabled = true;
			break;
		case 'select':
			selectEventEnabled = true;
			break;
	}
};

const pointerdown = (event: PointerEvent): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	switch (event.button) {
		case 0: {
			const target = event.target as HTMLElement & { dataValue: any };
			if (hasClass(target, 'nav-item') && !hasClass(target, 'selected')) {
				if (target.dataValue === undefined) {
					const string = target.getAttribute('value') ?? '';
					const isNumber = RegExp.number.test(string);
					target.dataValue = isNumber ? parseFloat(string) : string;
				}
				write(target.dataValue);
				if (selectEventEnabled) {
					const select = new Event('select');
					select.value = target.dataValue;
					element.dispatchEvent(select);
				}
			}
			break;
		}
	}
};

onMounted(() => {
	const element = root.value as any;
	if (!element) {
		return;
	}
	const elements = element.children;
	if (elements.length > 0) {
		let i = elements.length;
		while (--i >= 0) {
			const child = elements[i] as HTMLElement & { dataValue: any };
			if (hasClass(child, 'nav-item')) {
				const string = child.getAttribute('value') ?? '';
				const isNumber = RegExp.number.test(string);
				child.dataValue = isNumber ? parseFloat(string) : string;
			} else {
				element.removeChild(child);
			}
		}
	}
	element.read = read;
	element.write = write;
	element.unselect = unselect;
	element.on = on;
	element.addEventListener('pointerdown', pointerdown);
});

defineExpose({ read, write, unselect, on, root });
</script>
