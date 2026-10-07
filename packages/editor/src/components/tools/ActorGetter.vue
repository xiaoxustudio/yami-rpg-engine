<template>
	<WindowFrame ref="frame" id="actorGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.actorGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.actorGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.actorGetter-type.label')"
				id="actorGetter-type"
				v-tip="t('components.actorGetter-type.tip')"
				:ref="fieldRef('actorGetter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.actorGetter-memberId.label') }}</div>
			<NumberVar
				id="actorGetter-memberId"
				v-tip="t('components.actorGetter-memberId.tip')"
				:ref="fieldRef('actorGetter-memberId')"
				min="0"
				max="10000"
				v-model="form.memberId"
			/>
			<div class="text">{{ t('components.actorGetter-actorId.label') }}</div>
			<CustomBox
				id="actorGetter-actorId"
				v-tip="t('components.actorGetter-actorId.tip')"
				:ref="fieldRef('actorGetter-actorId')"
				v-focus
				type="file"
				filter="actor"
				v-model="form.actorId"
			/>
			<div class="text">{{ t('components.actorGetter-presetId.label') }}</div>
			<CustomBox
				id="actorGetter-presetId"
				v-tip="t('components.actorGetter-presetId.tip')"
				:ref="fieldRef('actorGetter-presetId')"
				v-focus
				type="preset-object"
				filter="actor"
				v-model="form.presetId"
			/>
			<div class="text">{{ t('components.actorGetter-variable.label') }}</div>
			<CustomBox
				id="actorGetter-variable"
				v-tip="t('components.actorGetter-variable.tip')"
				:ref="fieldRef('actorGetter-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useActorGetterWindow } from '@app/composables/useActorGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const actorGetter = useActorGetterWindow();
const form = actorGetter.form;

const { fields, fieldRef } = createAccessorFields();
ActorGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	ActorGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => actorGetter.onWindowClosed());
	}
});
</script>

<style>
#actorGetter {
	width: 324px;
	height: 122px;
}

#actorGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#actorGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
