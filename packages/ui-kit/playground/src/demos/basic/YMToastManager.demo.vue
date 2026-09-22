<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { YMToastManager, createToastManagerElement, type ToastManagerApi, YMButton } from '@ui-kit';
const toastRef = ref<InstanceType<typeof YMToastManager> | null>(null);
const lastMessage = ref('(none)');

let programmatic: ToastManagerApi | null = null;

onMounted(() => {
	programmatic = createToastManagerElement();
	programmatic.style.right = '340px';
	document.body.appendChild(programmatic);
});

onBeforeUnmount(() => {
	if (programmatic) {
		programmatic.remove();
		programmatic = null;
	}
});

const showInfo = (): void => {
	lastMessage.value = 'info: hello from YMToastManager';
	toastRef.value?.show('Hello from YMToastManager', 'info');
};

const showSuccess = (): void => {
	lastMessage.value = 'success: saved';
	toastRef.value?.show('Saved successfully', 'success', 3000);
};

const showError = (): void => {
	lastMessage.value = 'error: failed';
	toastRef.value?.show('Something went wrong', 'error', 6000);
};

const showProgrammatic = (): void => {
	lastMessage.value = 'programmatic toast';
	programmatic?.show('Created via createToastManagerElement', 'success', 2500);
};
</script>

<template>
	<section>
		<h2>YMToastManager</h2>
		<p class="desc">
			右下角 toast 通知；支持 info / success / error 三种类型与命令式 show 调用。
		</p>
		<div class="row">
			<YMButton size="sm" @click="showInfo">Info</YMButton>
			<YMButton size="sm" variant="primary" @click="showSuccess">Success</YMButton>
			<YMButton size="sm" variant="danger" @click="showError">Error</YMButton>
			<YMButton size="sm" @click="showProgrammatic">createToastManagerElement</YMButton>
			<span class="hint">last: {{ lastMessage }}</span>
		</div>
		<YMToastManager ref="toastRef" />
	</section>
</template>

<style scoped>
.hint {
	color: var(--ym-color-text-unit);
	font-size: var(--ym-font-size-sm);
}
</style>
