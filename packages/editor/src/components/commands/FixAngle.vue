<template>
	<WindowFrame id="fixAngle" :ref="registryRef(fieldEls, 'fixAngle')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fixAngle.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fixAngle-actor.label') }}</div>
			<CustomBox
				id="fixAngle-actor"
				:ref="registryRef(fieldEls, 'fixAngle-actor')"
				v-tip="t('components.fixAngle-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.fixAngle-fixed.label') }}</div>
			<SelectBox
				id="fixAngle-fixed"
				v-tip="t('components.fixAngle-fixed.tip')"
				:ref="registryRef(fieldEls, 'fixAngle-fixed')"
				v-model="form.fixed"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFixAngleCommandSchema } from '@app/composables/commands/useFixAngleCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useFixAngleCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'fixAngle-fixed',
		[true, false],
		(items) => fieldEls.get('fixAngle-fixed')?.loadItems?.(items),
		{ true: 'command.fixAngle.fixed.true', false: 'command.fixAngle.fixed.false' }
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#fixAngle {
	width: 324px;
	height: 122px;
}

#fixAngle-confirm {
	right: 108px;
	bottom: 10px;
}

#fixAngle-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
