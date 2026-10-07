<template>
	<WindowFrame id="localVariable" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.localVariable.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.localVariable-key.label') }}</div>
			<TextBox
				:label="t('components.localVariable-key.label')"
				id="localVariable-key"
				v-tip="t('components.localVariable-key.tip')"
				:ref="registryRef(textCaptureEls, 'localVariable-key')"
				v-model="form.key"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { registryRef } from '@app/utils/element-registry';
import { Selection, textCaptureEls } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const form = useTextCaptureWindow().localVariable.form;

const onConfirm = () => {
	Selection?.localVariable?.confirm?.(new Event('click'));
};
</script>

<style>
#localVariable {
	width: 324px;
	height: 98px;
}

#localVariable-confirm {
	right: 108px;
	bottom: 10px;
}

#localVariable-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
