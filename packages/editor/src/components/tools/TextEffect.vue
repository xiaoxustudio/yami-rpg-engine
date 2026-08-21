<template>
	<!-- 设置文字效果 -->
	<WindowFrame ref="frame" id="textEffect" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.textEffect.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.textEffect-type.label') }}</div><SelectBox id="textEffect-type" v-model="form.type" /> <div class="text">{{ t('components.textEffect-shadowOffsetX.label') }}</div
				><NumberBox id="textEffect-shadowOffsetX" min="-9" max="9" unit="px" v-model="form.shadowOffsetX" />
				<div class="text">{{ t('components.textEffect-shadowOffsetY.label') }}</div
				><NumberBox id="textEffect-shadowOffsetY" min="-9" max="9" unit="px" v-model="form.shadowOffsetY" />
				<div class="text">{{ t('components.textEffect-strokeWidth.label') }}</div
				><NumberBox id="textEffect-strokeWidth" min="1" max="20" unit="px" v-model="form.strokeWidth" />
				<div class="text">{{ t('components.textEffect-color.label') }}</div><ColorBox id="textEffect-color" v-model="form.color" />
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
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = useTextCaptureWindow().textEffect.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.textEffect?.confirm?.();
};
</script>
