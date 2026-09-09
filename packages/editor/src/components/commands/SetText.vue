<template>
	<WindowFrame id="setText" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setText.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setText-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setText-properties" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTextCommandSchema } from '@app/composables/commands/useSetTextCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { TextProperty } from '@app/commands/property-window/set-text-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetTextCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setText-properties')?.bind?.(TextProperty);
	$('#setText')?.on?.('closed', () => {
		clear($('#setText-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setText {
	width: 324px;
	height: 204px;
}

#setText-properties {
	height: 102px;
}

#setText-confirm {
	right: 108px;
	bottom: 10px;
}

#setText-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
