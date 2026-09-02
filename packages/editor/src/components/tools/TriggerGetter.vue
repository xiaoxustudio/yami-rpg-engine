<template>
	<!-- 触发器访问器窗口 -->
	<WindowFrame ref="frame" id="triggerGetter">
		<template #title
			><TitleBar
				>{{ t('components.triggerGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.triggerGetter-type.label') }}</div>
			<SelectBox id="triggerGetter-type" v-focus v-model="form.type" />
			<div class="text">{{ t('components.triggerGetter-variable.label') }}</div>
			<CustomBox
				id="triggerGetter-variable"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTriggerGetterWindow } from '@app/composables/useTriggerGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const triggerGetter = useTriggerGetterWindow();
const form = triggerGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => triggerGetter.onWindowClosed());
	}
});
</script>
