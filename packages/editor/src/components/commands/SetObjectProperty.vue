<template>
	<WindowFrame id="setObjectProperty"
				:ref="registryRef(fieldEls, 'setObjectProperty')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setObjectProperty.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Variable</div>
			<CustomBox
				id="setObjectProperty-variable"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">setObjectProperty</div>
			<ParamList id="setObjectProperty-list"
				:ref="registryRef(fieldEls, 'setObjectProperty-list')" v-focus v-model="form.list" />
			<div class="text">valueVariable</div>
			<CustomBox
				id="setObjectProperty-value-variable"
				v-focus
				type="variable"
				filter="all"
				v-model="form.valueVariable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	useSetObjectPropertyCommandSchema,
	IndexBind
} from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { clear } from '@app/utils/element-utils';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setObjectProperty-list')?.bind?.(IndexBind);
	fieldEls.get('setObjectProperty')?.on?.('closed', () => {
		clear(fieldEls.get('setObjectProperty-list'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setObjectProperty {
	width: 324px;
	height: 220px;
}

#setObjectProperty-list {
	height: 102px;
}

#setObjectProperty-confirm {
	right: 108px;
	bottom: 10px;
}

#setObjectProperty-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
