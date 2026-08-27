<template>
	<WindowFrame id="webSocketConnect" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.webSocketConnect.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">URL</div>
			<StringVar id="webSocketConnect-url" v-model="form.url" />
			<div class="text">ID</div>
			<StringVar id="webSocketConnect-id" v-model="form.id" />
			<div class="text">Protocols</div>
			<StringVar id="webSocketConnect-protocols" v-model="form.protocols" />
			<div class="text">OnOpen</div>
			<CustomBox id="webSocketConnect-onOpen" type="file" filter="event" @input="onOpen" />
			<div class="text">OnMessage</div>
			<CustomBox
				id="webSocketConnect-onMessage"
				type="file"
				filter="event"
				@input="onMessage"
			/>
			<div class="text">OnError</div>
			<CustomBox id="webSocketConnect-onError" type="file" filter="event" @input="onError" />
			<div class="text">OnClose</div>
			<CustomBox id="webSocketConnect-onClose" type="file" filter="event" @input="onClose" />
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

const onOpen = (value: unknown) => {
	form.onOpen = value;
};

const onMessage = (value: unknown) => {
	form.onMessage = value;
};

const onError = (value: unknown) => {
	form.onError = value;
};

const onClose = (value: unknown) => {
	form.onClose = value;
};

const onConfirm = () => {
	save();
};
</script>
