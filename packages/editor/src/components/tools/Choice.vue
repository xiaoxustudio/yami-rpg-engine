<template>
	<WindowFrame ref="frame" id="choice" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.choice.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.choice-content.label') }}</div
				><TextBox
					id="choice-content"
					v-model="form.content"
					menu="tag-local-var tag-global-var tag-localization"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import type { ChoicesForm } from '@app/legacy/command/show-options-window.ts';
import { Choices } from '@app/legacy/command/show-options-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const form = reactive<ChoicesForm>({ content: '' });

const setForm = (data: Partial<ChoicesForm>): void => {
	Object.assign(form, data);
	if ('content' in data) {
		const control = document.getElementById('choice-content') as
			| (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data.content as never);
		}
	}
};

const getForm = (): ChoicesForm => {
	const data = { ...form } as ChoicesForm;
	const control = document.getElementById('choice-content') as
		| (HTMLElement & { read?: () => unknown })
		| null;
	if (control && typeof control.read === 'function') {
		data.content = control.read() as string;
	}
	return data;
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Choices?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}

	on($('#choice'), 'closed', () => Choices.windowClosed?.(new Event('closed')));
	on($('#choice-confirm'), 'click', () => Choices.confirm?.(new Event('click')));
});
</script>
