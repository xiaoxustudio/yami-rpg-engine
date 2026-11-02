<template>
	<WindowFrame id="setText" :ref="controlRef('setText')" @confirm="onConfirm" @closed="onClosed">
		<template #title
			><TitleBar
				>{{ t('components.setText.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setText-element.label') }}</div>
			<CustomBox
				id="setText-element"
				:ref="controlRef('setText-element')"
				v-tip="t('components.setText-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setText-properties.label') }}</div>
			<ParamList
				id="setText-properties"
				:ref="controlRef('setText-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTextCommandSchema } from '@app/composables/commands/useSetTextCommandSchema';
import { clear } from '@app/utils/element-utils';
import { TextProperty } from '@app/commands/property-window/set-text-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setText' | 'setText-element' | 'setText-properties';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetTextCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(controlRoot(controls['setText-properties']));
};

onMounted(() => {
	controls['setText-properties']?.bind?.(TextProperty);
});
</script>

<style>
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
