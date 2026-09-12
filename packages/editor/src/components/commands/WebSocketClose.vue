<template>
	<WindowFrame id="webSocketClose" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.webSocketClose.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">ID</div>
			<StringVar id="webSocketClose-id"
				v-tip="t('components.webSocketClose-id.tip')" v-focus v-model="form.id" />
			<div class="text">Code</div>
			<NumberBox id="webSocketClose-code"
				v-tip="t('components.webSocketClose-code.tip')" min="1000" max="4999" v-model="code" />
			<div class="text">Reason</div>
			<StringVar id="webSocketClose-reason"
				v-tip="t('components.webSocketClose-reason.tip')" v-model="form.reason" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWebSocketCloseCommandSchema } from '@app/composables/commands/useWebSocketCloseCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import StringVar from '@app/components/common/StringVar.vue';

const { t } = useI18n();

const { form, save } = useWebSocketCloseCommandSchema();

const code = computed({
	get: () => form.code as number | string,
	set: (value) => {
		form.code = value;
	}
});

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#webSocketClose {
	width: 324px;
	height: 200px;
}

#webSocketClose-confirm {
	right: 108px;
	bottom: 10px;
}

#webSocketClose-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
