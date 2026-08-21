<template>
	<WindowFrame ref="frame" id="localVariable" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.localVariable.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.localVariable-key.label') }}</div><TextBox id="localVariable-key" v-model="form.key" />
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
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const form = useTextCaptureWindow().localVariable.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.localVariable?.confirm?.();
};
</script>
