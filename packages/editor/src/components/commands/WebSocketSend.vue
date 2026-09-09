<template>
	<WindowFrame id="webSocketSend" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.webSocketSend.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">ID</div>
			<StringVar id="webSocketSend-id" v-focus v-model="form.id" />
			<div class="text">Data</div>
			<StringVar id="webSocketSend-data" v-model="form.data" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWebSocketSendCommandSchema } from '@app/composables/commands/useWebSocketSendCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import StringVar from '@app/components/common/StringVar.vue';

const { t } = useI18n();

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
