<script setup lang="ts">
interface Props {
	idPrefix?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	applyLabel?: string;
	showApply?: boolean;
	confirmDisabled?: boolean;
}

withDefaults(defineProps<Props>(), {
	idPrefix: '',
	confirmLabel: 'Confirm',
	cancelLabel: 'Cancel',
	applyLabel: 'Apply',
	showApply: false,
	confirmDisabled: false
});

const emit = defineEmits<{
	confirm: [];
	apply: [];
	cancel: [];
}>();

/**
 * 三个按钮同时走**两条**通道，过渡期需要：
 *
 *   1. **原生派生**（`dispatchEvent`，冒泡）—— 保留元素优先契约：消费者仍可直接在窗口根元素上
 *      `addEventListener('confirm', …)`。**改了会破坏外部插件/扩展**，故不删。
 *   2. **Vue emit** —— 组件间通信的正路。`YMWindowFrame` 现在用模板 `@confirm` / `@apply` /
 *      `@cancel` 接住它，不再需要 `element.addEventListener('confirm', …)` 那层桥。
 *
 * ⚠️ 两条通道**必须由不同的消费者认领**，否则会双触发：`YMWindowFrame` 已改为只走 emit 通道
 * （原先它同时挂了 `element.addEventListener('confirm')`）。若将来有人在 `YMWindowFrame`
 * 根元素上重新挂原生 `confirm` 监听，就会与这条 emit 叠加 —— 那正是本仓 12 个包装组件
 * 曾经"点确定没反应"的同源陷阱的镜像版本（当时是**没人接**，现在会是**接两次**）。
 */
const dispatch = (type: 'confirm' | 'apply' | 'cancel', event: MouseEvent): void => {
	(event.currentTarget as HTMLElement).dispatchEvent(new Event(type, { bubbles: true }));
	switch (type) {
		case 'confirm':
			emit('confirm');
			break;
		case 'apply':
			emit('apply');
			break;
		case 'cancel':
			emit('cancel');
			break;
	}
};
</script>

<template>
	<button
		:id="idPrefix + '-confirm'"
		name="confirm"
		hotkey="Ctrl+Enter"
		:disabled="confirmDisabled"
		@click="dispatch('confirm', $event)"
	>
		{{ confirmLabel }}
	</button>
	<button
		v-if="showApply"
		:id="idPrefix + '-apply'"
		name="apply"
		@click="dispatch('apply', $event)"
	>
		{{ applyLabel }}
	</button>
	<button
		:id="idPrefix + '-cancel'"
		name="cancel"
		hotkey="Escape"
		@click="dispatch('cancel', $event)"
	>
		{{ cancelLabel }}
	</button>
</template>

<style module>
:global(:where(button[name='confirm'])) {
	right: 108px;
	bottom: 10px;
}

:global(:where(button[name='cancel'])) {
	right: 10px;
	bottom: 10px;
}

:global(:where(.window-frame:has(button[name='apply']) button[name='confirm'])) {
	right: 206px;
}

:global(:where(.window-frame:has(button[name='apply']) button[name='cancel'])) {
	right: 108px;
}

:global(:where(button[name='apply'])) {
	right: 10px;
	bottom: 10px;
}
</style>
