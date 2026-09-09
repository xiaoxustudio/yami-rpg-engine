<template>
	<WindowFrame id="setAnimation" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setAnimation-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setAnimation-properties" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetAnimationCommandSchema } from '@app/composables/commands/useSetAnimationCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { AnimationProperty } from '@app/commands/property-window/set-animation-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetAnimationCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setAnimation-properties')?.bind?.(AnimationProperty);
	$('#setAnimation')?.on?.('closed', () => {
		clear($('#setAnimation-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setAnimation {
	width: 324px;
	height: 204px;
}

#setAnimation-properties {
	height: 102px;
}

#setAnimation-confirm {
	right: 108px;
	bottom: 10px;
}

#setAnimation-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
