<template>
	<WindowFrame id="setActive" :ref="controlRef('setActive')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setActive.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setActive-actor.label') }}</div>
			<CustomBox
				id="setActive-actor"
				:ref="controlRef('setActive-actor')"
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
				:ref="controlRef('setActive-active')"
				v-model="form.active"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetActiveCommandSchema } from '@app/composables/commands/useSetActiveCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setActive' | 'setActive-active' | 'setActive-actor';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetActiveCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setActive-active',
		[true, false],
		(items) => controls['setActive-active']?.loadItems?.(items),
		{ true: 'command.setActive.active.true', false: 'command.setActive.active.false' }
	);
});
</script>

<style>
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
