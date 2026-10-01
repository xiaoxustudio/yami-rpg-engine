<template>
	<WindowFrame id="setActive" :ref="registryRef(fieldEls, 'setActive')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setActive.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setActive-actor.label') }}</div>
			<CustomBox
				id="setActive-actor"
				:ref="registryRef(fieldEls, 'setActive-actor')"
				v-tip="t('components.setActive-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setActive-active.label') }}</div>
			<SelectBox
				:label="t('components.setActive-active.label')"
				id="setActive-active"
				v-tip="t('components.setActive-active.tip')"
				:ref="registryRef(fieldEls, 'setActive-active')"
				v-model="form.active"
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
import { useSetActiveCommandSchema } from '@app/composables/commands/useSetActiveCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetActiveCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setActive-active',
		[true, false],
		(items) => fieldEls.get('setActive-active')?.loadItems?.(items),
		{ true: 'command.setActive.active.true', false: 'command.setActive.active.false' }
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setActive {
	width: 324px;
	height: 122px;
}

#setActive-confirm {
	right: 108px;
	bottom: 10px;
}

#setActive-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
