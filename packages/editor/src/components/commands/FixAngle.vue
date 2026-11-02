<template>
	<WindowFrame id="fixAngle" :ref="controlRef('fixAngle')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fixAngle.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fixAngle-actor.label') }}</div>
			<CustomBox
				id="fixAngle-actor"
				:ref="controlRef('fixAngle-actor')"
				v-tip="t('components.fixAngle-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.fixAngle-fixed.label') }}</div>
			<SelectBox
				:label="t('components.fixAngle-fixed.label')"
				id="fixAngle-fixed"
				v-tip="t('components.fixAngle-fixed.tip')"
				:ref="controlRef('fixAngle-fixed')"
				v-model="form.fixed"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFixAngleCommandSchema } from '@app/composables/commands/useFixAngleCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'fixAngle' | 'fixAngle-actor' | 'fixAngle-fixed';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useFixAngleCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'fixAngle-fixed',
		[true, false],
		(items) => controls['fixAngle-fixed']?.loadItems?.(items),
		{ true: 'command.fixAngle.fixed.true', false: 'command.fixAngle.fixed.false' }
	);
});
</script>

<style>
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
