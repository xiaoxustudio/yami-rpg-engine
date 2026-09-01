<template>
	<WindowFrame ref="frame" id="positionGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.positionGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.positionGetter-type.label') }}</div>
			<SelectBox id="positionGetter-type" v-focus v-model="form.type" />
			<div class="text">{{ t('components.positionGetter-common-x.label') }}</div>
			<NumberVar
				id="positionGetter-common-x"
				min="-512"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.x"
			/>
			<div class="text">{{ t('components.positionGetter-common-y.label') }}</div>
			<NumberVar
				id="positionGetter-common-y"
				min="-512"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.y"
			/>
			<div class="text">{{ t('components.positionGetter-actor.label') }}</div>
			<CustomBox id="positionGetter-actor" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.positionGetter-trigger.label') }}</div>
			<CustomBox id="positionGetter-trigger" type="trigger" v-model="form.trigger" />
			<div class="text">{{ t('components.positionGetter-light.label') }}</div>
			<CustomBox id="positionGetter-light" type="light" v-model="form.light" />
			<div class="text">{{ t('components.positionGetter-region.label') }}</div>
			<CustomBox id="positionGetter-region" type="region" v-model="form.region" />
			<div class="text">{{ t('components.positionGetter-region-mode.label') }}</div>
			<SelectBox id="positionGetter-region-mode" v-model="form.mode" />
			<div class="text">{{ t('components.positionGetter-objectId.label') }}</div>
			<CustomBox
				id="positionGetter-objectId"
				v-focus
				type="preset-object"
				filter="any"
				v-model="form.objectId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import { usePositionGetterWindow } from '@app/composables/usePositionGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const positionGetter = usePositionGetterWindow();
const form = positionGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	PositionGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => positionGetter.onWindowClosed());
	}
});
</script>
