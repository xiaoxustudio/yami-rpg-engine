<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneRegion-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneRegion-general-grid">
			<div class="text">{{ t('components.sceneRegion-name.label') || 'Name' }}</div>
			<TextBox
				id="sceneRegion-name"
				v-tip="t('components.sceneRegion-name.tip')"
				ref="elName"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.sceneRegion-color.label') || 'Color' }}</div>
			<ColorBox
				id="sceneRegion-color"
				v-tip="t('components.sceneRegion-color.tip')"
				ref="elColor"
				v-model="form.color"
				@input="onParamInput"
			></ColorBox>
			<div class="text">{{ t('components.sceneRegion-x.label') || 'X' }}</div>
			<NumberBox
				id="sceneRegion-x"
				v-tip="t('components.sceneRegion-x.tip')"
				ref="elX"
				v-model="form.x"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneRegion-y.label') || 'Y' }}</div>
			<NumberBox
				id="sceneRegion-y"
				v-tip="t('components.sceneRegion-y.tip')"
				ref="elY"
				v-model="form.y"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneRegion-width.label') || 'Width' }}</div>
			<NumberBox
				id="sceneRegion-width"
				v-tip="t('components.sceneRegion-width.tip')"
				ref="elWidth"
				v-model="form.width"
				@input="onParamInput"
				min="0"
				max="512"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneRegion-height.label') || 'Height' }}</div>
			<NumberBox
				id="sceneRegion-height"
				v-tip="t('components.sceneRegion-height.tip')"
				ref="elHeight"
				v-model="form.height"
				@input="onParamInput"
				min="0"
				max="512"
				decimals="4"
			></NumberBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneRegion-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			id="sceneRegion-conditions"
			v-tip="t('components.sceneRegion-conditions.tip')"
			ref="elConditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneRegion-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneRegion-events"
			v-tip="t('components.sceneRegion-events.tip')"
			ref="elEvents"
			class="inspector-list"
			filter="region"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneRegion-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneRegion-scripts"
			v-tip="t('components.sceneRegion-scripts.tip')"
			ref="elScripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneRegion-parameter-pane" ref="elParameterPane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { useSceneRegionPage } from '@app/composables/useSceneRegionPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useSceneRegionPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput } = useInspectorInput();

const elName = ref<InstanceType<typeof TextBox> | null>(null);
const elColor = ref<InstanceType<typeof ColorBox> | null>(null);
const elX = ref<InstanceType<typeof NumberBox> | null>(null);
const elY = ref<InstanceType<typeof NumberBox> | null>(null);
const elWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elConditions = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'sceneRegion-conditions', elConditions.value);
	registerElement(inspectorEls, 'sceneRegion-events', elEvents.value);
	registerElement(inspectorEls, 'sceneRegion-scripts', elScripts.value);
	registerElement(inspectorEls, 'sceneRegion-parameter-pane', elParameterPane.value);
	const editor = Inspector.sceneRegion;
	if (!editor) return;

	const el = inspectorEls.get('sceneRegion-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	try {
		elConditions.value?.bind(new ConditionListInterface(editor, Scene));

		elEvents.value?.bind(new EventListInterface(editor, Scene));

		elScripts.value?.bind(
			new ScriptListInterface(editor as { target?: { id: string } }, Scene)
		);

		const scriptsEl = elScripts.value?.root;
		if (scriptsEl) {
			elParameterPane.value?.bind(scriptsEl);
		}

		const elements = [
			elName.value?.root,
			elColor.value?.root,
			elX.value?.root,
			elY.value?.root,
			elWidth.value?.root,
			elHeight.value?.root
		].filter((el): el is HTMLElement => el != null);
		bindInput(elements, editor, Scene as unknown as { history: unknown });

		[elConditions.value?.root, elEvents.value?.root, elScripts.value?.root]
			.filter((el): el is HTMLElement => el != null)
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	} catch (e) {
		console.warn('[SceneRegionPage] init skipped:', (e as Error)?.message);
	}

	sync();
});
</script>
