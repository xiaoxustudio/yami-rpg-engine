<template>
	<!-- 设置数量窗口 -->
	<WindowFrame ref="frame" id="setQuantity" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setQuantity.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setQuantity-quantity.label') }}</div
				><NumberBox
					id="setQuantity-quantity"
					min="1"
					:max="form.max"
					:model-value="form.quantity"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SetQuantity, type SetQuantityForm } from '@app/legacy/tools/set-number-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const form = reactive<SetQuantityForm>({ quantity: 1, max: 1 });

const setForm = (data: Partial<SetQuantityForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = document.getElementById(id) as
			| (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
	const control = document.getElementById('setQuantity-quantity') as
		| (HTMLElement & { input?: HTMLInputElement })
		| null;
	if (control?.input) {
		control.input.max = String(form.max);
	}
};

const getForm = (): SetQuantityForm => {
	const data = { ...form } as SetQuantityForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = document.getElementById(id) as
			| (HTMLElement & { read?: () => unknown })
			| null;
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof SetQuantityForm> = {
	'setQuantity-quantity': 'quantity'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	SetQuantity?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}


});
</script>
