<template>
	<WindowFrame id="simulateKey" :ref="controlRef('simulateKey')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.simulateKey.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.simulateKey-operation.label') }}</div>
			<SelectBox
				:label="t('components.simulateKey-operation.label')"
				id="simulateKey-operation"
				v-tip="t('components.simulateKey-operation.tip')"
				:ref="controlRef('simulateKey-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.simulateKey-keycode.label') }}</div>
			<KeyboardBox
				:label="t('components.simulateKey-keycode.label')"
				id="simulateKey-keycode"
				:ref="controlRef('simulateKey-keycode')"
				v-tip="t('components.simulateKey-keycode.tip')"
				@input="onKeycode"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlRefs } from '@app/composables/control-refs';
import { useSimulateKeyCommandSchema } from '@app/composables/useSimulateKeyCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'simulateKey' | 'simulateKey-keycode' | 'simulateKey-operation';

const { controls, controlRef } = useControlRefs<Id>();

const { form, save } = useSimulateKeyCommandSchema({ controls: () => controls });

const onKeycode = (value: number) => {
	form.keycode = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('simulateKey-operation', ['click', 'press', 'release'], (items) =>
		controls['simulateKey-operation']?.loadItems?.(items)
	);
});
</script>

<style>
#simulateKey {
	width: 324px;
	height: 122px;
}

#simulateKey-confirm {
	right: 108px;
	bottom: 10px;
}

#simulateKey-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
