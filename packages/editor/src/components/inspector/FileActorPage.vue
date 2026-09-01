<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileActor-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileActor-general-grid">
			<div class="text">{{ t('components.fileActor-portrait.label') || 'Portrait' }}</div>
			<CustomBox
				id="fileActor-portrait"
				type="file"
				filter="image"
				:model-value="form.portrait"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="fileActor-clip"
				type="clip"
				image="fileActor-portrait"
				:model-value="form.clip"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileActor-animationId.label') || 'Animation' }}</div>
			<CustomBox
				id="fileActor-animationId"
				type="file"
				filter="animation"
				:model-value="form.animationId"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
			<div class="text">Idle Motion</div>
			<SelectBox id="fileActor-idleMotion" v-model="form.idleMotion" @input="onParamInput" />
			<div class="text">Move Motion</div>
			<SelectBox id="fileActor-moveMotion" v-model="form.moveMotion" @input="onParamInput" />
			<div class="text">Rotatable</div>
			<SelectBox
				id="fileActor-rotatable"
				ref="elRotatable"
				v-model="form.rotatable"
				@input="onParamInput"
			/>
			<div class="text">Passage Terrain</div>
			<SelectBox
				id="fileActor-passage"
				ref="elPassage"
				v-model="form.passage"
				@input="onParamInput"
			/>
			<div class="text">Movement Speed</div>
			<NumberBox
				id="fileActor-speed"
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
				ref="elShape"
				v-model="form.shape"
				@input="onParamInput"
			/>
			<div class="text">Collision Size</div>
			<NumberBox
				id="fileActor-size"
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
				ref="elImmovable"
				v-model="form.immovable"
				@input="onParamInput"
			/>
			<div class="text">Scale</div>
			<NumberBox
				id="fileActor-scale"
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
				v-model="form.priority"
				min="-512"
				max="512"
				decimals="4"
				@input="onParamInput"
			/>
			<div class="text">Inherit</div>
			<CustomBox
				id="fileActor-inherit"
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
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useFileActorPage } from '@app/composables/useFileActorPage';
import { useInspectorStore } from '@app/stores/inspector';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const { t } = useI18n();

const { form, sync, onParamInput } = useFileActorPage();

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
