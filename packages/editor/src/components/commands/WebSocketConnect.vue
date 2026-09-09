<template>
	<WindowFrame id="webSocketConnect" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.webSocketConnect.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">URL</div>
			<StringVar id="webSocketConnect-url" v-focus v-model="form.url" />
			<div class="text">ID</div>
			<StringVar id="webSocketConnect-id" v-model="form.id" />
			<div class="text">Protocols</div>
			<StringVar id="webSocketConnect-protocols" v-model="form.protocols" />
			<div class="text">OnOpen</div>
			<CustomBox
				id="webSocketConnect-onOpen"
				type="file"
				filter="event"
				v-model="form.onOpen"
			/>
			<div class="text">OnMessage</div>
			<CustomBox
				id="webSocketConnect-onMessage"
				type="file"
				filter="event"
				v-model="form.onMessage"
			/>
			<div class="text">OnError</div>
			<CustomBox
				id="webSocketConnect-onError"
				type="file"
				filter="event"
				v-model="form.onError"
			/>
			<div class="text">OnClose</div>
			<CustomBox
				id="webSocketConnect-onClose"
				type="file"
				filter="event"
				v-model="form.onClose"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWebSocketConnectCommandSchema } from '@app/composables/commands/useWebSocketConnectCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';

const { t } = useI18n();

const { form, save } = useWebSocketConnectCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#webSocketConnect {
	width: 324px;
	height: 430px;
}

#webSocketConnect-confirm {
	right: 108px;
	bottom: 10px;
}

#webSocketConnect-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
