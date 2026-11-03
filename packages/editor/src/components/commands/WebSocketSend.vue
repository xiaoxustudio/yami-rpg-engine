<template>
	<WindowFrame id="webSocketSend" :ref="controlRef('webSocketSend')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.webSocketSend.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.webSocketSend-id.label') }}</div>
			<StringVar
				id="webSocketSend-id"
				:ref="controlRef('webSocketSend-id')"
				v-tip="t('components.webSocketSend-id.tip')"
				v-focus
				v-model="form.id"
			/>
			<div class="text">{{ t('components.webSocketSend-data.label') }}</div>
			<StringVar
				id="webSocketSend-data"
				:ref="controlRef('webSocketSend-data')"
				v-tip="t('components.webSocketSend-data.tip')"
				v-model="form.data"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted } from 'vue';
import { useWebSocketSendCommandSchema } from '@app/composables/commands/useWebSocketSendCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideWebSocketSendBridge,
	resetWebSocketSendBridge,
	type WebSocketSendBridge
} from '@app/composables/web-socket-send-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'webSocketSend-data' | 'webSocketSend-id' | 'webSocketSend';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useWebSocketSendCommandSchema(() => controls);

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 保存时要读两个输入框的当前值、校验失败时把焦点放回去。 */
const bridgeApi: WebSocketSendBridge = {
	getId: () => controls['webSocketSend-id']?.read?.(),
	getData: () => controls['webSocketSend-data']?.read?.(),
	focusId: () => controls['webSocketSend-id']?.getFocus?.(),
	focusData: () => controls['webSocketSend-data']?.getFocus?.()
};

onMounted(() => {
	provideWebSocketSendBridge(bridgeApi);
	onUnmounted(() => resetWebSocketSendBridge(bridgeApi));
});
</script>

<style>
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
