<template>
	<WindowFrame ref="frame" id="insertImage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.insertImage.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.insertImage-mode.label') }}</div>
			<SelectBox id="insertImage-mode" v-model="form.mode" />
			<div class="text">{{ t('components.insertImage-image.label') }}</div>
			<CustomBox id="insertImage-image" type="file" filter="image" v-model="form.image" />
			<div class="text">{{ t('components.insertImage-clip.label') }}</div>
			<CustomBox
				id="insertImage-clip"
				type="clip"
				image="insertImage-image"
				v-model="form.clip"
			/>
			<div class="text">{{ t('components.insertImage-width.label') }}</div>
			<NumberBox id="insertImage-width" min="0" max="10000" v-model="form.width" />
			<div class="text">{{ t('components.insertImage-height.label') }}</div>
			<NumberBox id="insertImage-height" min="0" max="10000" v-model="form.height" />
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
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = useTextCaptureWindow().image.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.image?.confirm?.();
};
</script>
