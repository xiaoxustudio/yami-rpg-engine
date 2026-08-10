<template>
	<div class="radio-proxy" ref="root" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
	addClass,
	removeClass,
	hasClass,
	enable,
	disable,
	dispatchChangeEvent
} from '@/util/element-utils';

interface RadioRelationTarget extends HTMLElement {
	enable?(): void;
	disable?(): void;
}

interface RadioRelationEntry {
	case: any;
	targets: RadioRelationTarget[];
}

interface RadioProxyElement extends HTMLElement {
	dataValue: any;
	relations: RadioRelationEntry[];
	cancelable: boolean;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	reset(): void;
	enable(): void;
	disable(): void;
	relate(entries: RadioRelationEntry[]): void;
	toggleRelatedElements(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const emit = defineEmits<{
	write: [value: any];
	input: [value: any, lastValue: any];
}>();

const root = ref<RadioProxyElement | null>(null);

const dataValue = ref<any>(null);
const relations = ref<RadioRelationEntry[]>([]);
const cancelable = ref(false);
const writeEventEnabled = ref(false);
const inputEventEnabled = ref(false);

const read = (): any => dataValue.value;

const toggleRelatedElements = (): void => {
	const el = root.value;
	if (!el) return;
	if (relations.value.length !== 0) {
		if (!hasClass(el, 'disabled')) {
			const entries = relations.value;
			const selection = entries.find((entry) => entry.case === dataValue.value);
			for (const entry of entries) {
				if (entry.case === dataValue.value) {
					for (const element of entry.targets) {
						if (typeof element.enable === 'function') {
							element.enable();
						} else {
							enable(element);
						}
					}
				} else {
					for (const element of selection
						? Array.subtract(entry.targets, selection.targets)
						: entry.targets) {
						if (typeof element.disable === 'function') {
							element.disable();
						} else {
							disable(element);
						}
					}
				}
			}
		} else {
			const entries = relations.value;
			for (const entry of entries) {
				for (const element of entry.targets) {
					if (typeof element.disable === 'function') {
						element.disable();
					} else {
						disable(element);
					}
				}
			}
		}
	}
};

const write = (value: any): void => {
	const el = root.value;
	if (!el) return;
	const elements = document.getElementsByName(
		el.id
	) as unknown as NodeListOf<RadioProxyElement>;
	for (const element of elements) {
		if (element.dataValue === value) {
			addClass(element as HTMLElement, 'selected');
			dataValue.value = value;
		} else {
			removeClass(element as HTMLElement, 'selected');
		}
	}
	if (!hasClass(el, 'disabled')) {
		toggleRelatedElements();
	}
	if (writeEventEnabled.value) {
		const write = new Event('write') as Event & {
			value: any;
		};
		write.value = dataValue.value;
		el.dispatchEvent(write);
	}
	emit('write', dataValue.value);
};

const input = (value: any): void => {
	const el = root.value;
	if (!el) return;
	const lastValue = dataValue.value;
	if (lastValue !== value) {
		write(value);
		if (inputEventEnabled.value) {
			const input = new Event('input') as Event & {
				value: any;
				lastValue: any;
			};
			input.value = dataValue.value;
			input.lastValue = lastValue;
			el.dispatchEvent(input);
		}
		dispatchChangeEvent(el);
		emit('input', dataValue.value, lastValue);
	}
};

const reset = (): void => {
	const el = root.value;
	if (!el) return;
	if (dataValue.value !== null) {
		const elements = document.getElementsByName(
			el.id
		) as unknown as NodeListOf<RadioProxyElement>;
		for (const element of elements) {
			if (element.dataValue === dataValue.value) {
				removeClass(element as HTMLElement, 'selected');
				break;
			}
		}
		dataValue.value = null;
	}
};

const enable = (): void => {
	const el = root.value;
	if (!el) return;
	if (removeClass(el, 'disabled')) {
		const elements = document.getElementsByName(el.id);
		for (const element of elements) {
			removeClass(element as HTMLElement, 'disabled');
		}
		toggleRelatedElements();
	}
};

const disable = (): void => {
	const el = root.value;
	if (!el) return;
	if (addClass(el, 'disabled')) {
		const elements = document.getElementsByName(el.id);
		for (const element of elements) {
			addClass(element as HTMLElement, 'disabled');
		}
		toggleRelatedElements();
	}
};

const relate = (entries: RadioRelationEntry[]): void => {
	relations.value = entries;
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
	switch (type) {
		case 'write':
			writeEventEnabled.value = true;
			break;
		case 'input':
			inputEventEnabled.value = true;
			break;
	}
};

defineExpose({ read, write, input, reset, enable, disable, relate, on, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.input = input;
	el.reset = reset;
	el.enable = enable;
	el.disable = disable;
	el.relate = relate;
	el.on = on;
	el.dataValue = null;
	el.relations = [];
	el.cancelable = false;
});
</script>
