<template>
	<WindowFrame id="transferGlobalActor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.transferGlobalActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.transferGlobalActor-actor.label') }}</div>
			<CustomBox
				id="transferGlobalActor-actor"
				v-tip="t('components.transferGlobalActor-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.transferGlobalActor-position.label') }}</div>
			<CustomBox
				id="transferGlobalActor-position"
				v-tip="t('components.transferGlobalActor-position.tip')"
				type="position"
				v-model="form.position"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTransferGlobalActorCommandSchema } from '@app/composables/commands/useTransferGlobalActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useTransferGlobalActorCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#transferGlobalActor {
	width: 324px;
	height: 122px;
}

#transferGlobalActor-confirm {
	right: 108px;
	bottom: 10px;
}

#transferGlobalActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
