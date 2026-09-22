<template>
	<WindowFrame
		id="webSocketSend"
		:ref="registryRef(fieldEls, 'webSocketSend')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.webSocketSend.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.webSocketSend-id.label') }}</div>
			<StringVar
				id="webSocketSend-id"
				:ref="registryRef(fieldEls, 'webSocketSend-id')"
				v-tip="t('components.webSocketSend-id.tip')"
				v-focus
				v-model="form.id"
			/>
			<div class="text">{{ t('components.webSocketSend-data.label') }}</div>
			<StringVar
				id="webSocketSend-data"
				:ref="registryRef(fieldEls, 'webSocketSend-data')"
				v-tip="t('components.webSocketSend-data.tip')"
				v-model="form.data"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { useWebSocketSendCommandSchema } from '@app/composables/commands/useWebSocketSendCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import StringVar from '@app/components/common/StringVar.vue';

const { t } = useI18n();

// 本组件的控件元素注册表
const fieldEls = createElementRegistry(composableEls);

const { form, save } = useWebSocketSendCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#webSocketSend {
	width: 324px;
	height: 180px;
}

#webSocketSend-confirm {
	right: 108px;
	bottom: 10px;
}

#webSocketSend-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
