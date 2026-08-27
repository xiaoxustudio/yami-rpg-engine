<template>
	<!-- 设置文字位置 -->
	<WindowFrame ref="frame" id="textPosition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.textPosition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.textPosition-axis.label') }}</div>
			<SelectBox id="textPosition-axis" v-model="form.axis" />
			<div class="text">{{ t('components.textPosition-operation.label') }}</div>
			<SelectBox id="textPosition-operation" v-model="form.operation" />
			<div class="text">{{ t('components.textPosition-value.label') }}</div>
			<NumberBox
				id="textPosition-value"
				min="-1000"
				max="1000"
				unit="px"
				v-model="form.value"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selection } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = useTextCaptureWindow().textPosition.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.textPosition?.confirm?.();
};
</script>
