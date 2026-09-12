<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileActor-general-grid">
			<div class="text">{{ t('components.fileActor-portrait.label') || 'Portrait' }}</div>
			<CustomBox
				id="fileActor-portrait"
				v-tip="t('components.fileActor-portrait.tip')"
				type="file"
				filter="image"
				:model-value="form.portrait"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="fileActor-clip"
				v-tip="t('components.fileActor-clip.tip')"
				type="clip"
				image="fileActor-portrait"
				:model-value="form.clip"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-animationId.label') || 'Animation' }}</div>
			<CustomBox
				id="fileActor-animationId"
				v-tip="t('components.fileActor-animationId.tip')"
				type="file"
				filter="animation"
				:model-value="form.animationId"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
			<div class="text">Idle Motion</div>
			<SelectBox id="fileActor-idleMotion"
				v-tip="t('components.fileActor-idleMotion.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-idleMotion')" v-model="form.idleMotion" @input="onParamInput" />
			<div class="text">Move Motion</div>
			<SelectBox id="fileActor-moveMotion"
				v-tip="t('components.fileActor-moveMotion.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-moveMotion')" v-model="form.moveMotion" @input="onParamInput" />
			<div class="text">Rotatable</div>
			<SelectBox
				id="fileActor-rotatable"
				v-tip="t('components.fileActor-rotatable.tip')"
				ref="elRotatable"
				v-model="form.rotatable"
				@input="onParamInput"
			/>
			<div class="text">Passage Terrain</div>
			<SelectBox
				id="fileActor-passage"
				v-tip="t('components.fileActor-passage.tip')"
				ref="elPassage"
				v-model="form.passage"
				@input="onParamInput"
			/>
			<div class="text">Movement Speed</div>
			<NumberBox
				id="fileActor-speed"
				v-tip="t('components.fileActor-speed.tip')"
				v-model="form.speed"
				min="0"
				max="32"
				decimals="4"
				unit="t/s"
				@input="onParamInput"
			/>
			<div class="text">Collision Shape</div>
			<SelectBox
				id="fileActor-shape"
				v-tip="t('components.fileActor-shape.tip')"
				ref="elShape"
				v-model="form.shape"
				@input="onParamInput"
			/>
			<div class="text">Collision Size</div>
			<NumberBox
				id="fileActor-size"
				v-tip="t('components.fileActor-size.tip')"
				v-model="form.size"
				min="0"
				max="16"
				step="0.1"
				decimals="4"
				unit="t"
				@input="onParamInput"
			/>
			<div class="text">Collision Weight</div>
			<NumberBox
				id="fileActor-weight"
				v-tip="t('components.fileActor-weight.tip')"
				v-model="form.weight"
				min="0"
				max="8"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			/>
			<div class="text">Immovable</div>
			<SelectBox
				id="fileActor-immovable"
				v-tip="t('components.fileActor-immovable.tip')"
				ref="elImmovable"
				v-model="form.immovable"
				@input="onParamInput"
			/>
			<div class="text">Scale</div>
			<NumberBox
				id="fileActor-scale"
				v-tip="t('components.fileActor-scale.tip')"
				v-model="form.scale"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			/>
			<div class="text">Priority</div>
			<NumberBox
				id="fileActor-priority"
				v-tip="t('components.fileActor-priority.tip')"
				v-model="form.priority"
				min="-512"
				max="512"
				decimals="4"
				@input="onParamInput"
			/>
			<div class="text">Inherit</div>
			<CustomBox
				id="fileActor-inherit"
				v-tip="t('components.fileActor-inherit.tip')"
				type="file"
				filter="actor"
				:model-value="form.inherit"
				@input="onParamInput"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-sprites.label') || 'Sprites' }}</DetailSummary>
		<ParamList
			id="fileActor-sprites"
				v-tip="t('components.fileActor-sprites.tip')"
			ref="elSprites"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-attributes.label') || 'Attributes'
		}}</DetailSummary>
		<ParamList
			id="fileActor-attributes"
				v-tip="t('components.fileActor-attributes.tip')"
			ref="elAttributes"
			@change="onListChange"
			class="inspector-list"
			group="actor"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-skills.label') || 'Skills' }}</DetailSummary>
		<ParamList
			id="fileActor-skills"
				v-tip="t('components.fileActor-skills.tip')"
			ref="elSkills"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-equipments.label') || 'Equipments'
		}}</DetailSummary>
		<ParamList
			id="fileActor-equipments"
				v-tip="t('components.fileActor-equipments.tip')"
			ref="elEquipments"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-inventory.label') || 'Inventory'
		}}</DetailSummary>
		<ParamList
			id="fileActor-inventory"
				v-tip="t('components.fileActor-inventory.tip')"
			ref="elInventory"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileActor-events"
				v-tip="t('components.fileActor-events.tip')"
			ref="elEvents"
			@change="onListChange"
			class="inspector-list"
			filter="actor"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileActor-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileActor-scripts"
				v-tip="t('components.fileActor-scripts.tip')"
			ref="elScripts"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileActor-parameter-pane" ref="elParameterPane" />
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef, registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useFileActorPage } from '@app/composables/useFileActorPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useFileActorPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.fileActor?.animationIdWrite?.({ value });
};
const onListChange = () => {
	Inspector?.fileActor?.listChange?.();
};

const elRotatable = ref<InstanceType<typeof SelectBox> | null>(null);
const elPassage = ref<InstanceType<typeof SelectBox> | null>(null);
const elShape = ref<InstanceType<typeof SelectBox> | null>(null);
const elImmovable = ref<InstanceType<typeof SelectBox> | null>(null);
const elSprites = ref<InstanceType<typeof ParamList> | null>(null);
const elAttributes = ref<InstanceType<typeof ParamList> | null>(null);
const elSkills = ref<InstanceType<typeof ParamList> | null>(null);
const elEquipments = ref<InstanceType<typeof ParamList> | null>(null);
const elInventory = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'fileActor-sprites', elSprites.value);
	registerElement(inspectorEls, 'fileActor-attributes', elAttributes.value);
	registerElement(inspectorEls, 'fileActor-skills', elSkills.value);
	registerElement(inspectorEls, 'fileActor-equipments', elEquipments.value);
	registerElement(inspectorEls, 'fileActor-inventory', elInventory.value);
	registerElement(inspectorEls, 'fileActor-events', elEvents.value);
	registerElement(inspectorEls, 'fileActor-scripts', elScripts.value);
	registerElement(inspectorEls, 'fileActor-parameter-pane', elParameterPane.value);
	const editor = Inspector.fileActor;
	if (!editor) return;

	const el = document.getElementById('fileActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	elRotatable.value?.loadItems([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);

	elPassage.value?.loadItems([
		{ name: 'Land', value: 'land' },
		{ name: 'Water', value: 'water' },
		{ name: 'Unrestricted', value: 'unrestricted' }
	]);

	elShape.value?.loadItems([
		{ name: 'Square', value: 'square' },
		{ name: 'Circle', value: 'circle' }
	]);

	elImmovable.value?.loadItems([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);

	if (editor.sprites) elSprites.value?.bind(editor.sprites);
	elAttributes.value?.bind(new AttributeListInterface());
	if (editor.skills) elSkills.value?.bind(editor.skills);
	if (editor.equipments) elEquipments.value?.bind(editor.equipments);
	if (editor.inventory) elInventory.value?.bind(editor.inventory);
	elEvents.value?.bind(new EventListInterface(editor));
	elScripts.value?.bind(new ScriptListInterface());
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);

	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#fileActor-inventory-confirm {
	right: 108px;
	bottom: 10px;
}

#fileActor-inventory-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

