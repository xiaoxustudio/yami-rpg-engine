<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileActor-general-grid') || 'General' }}</DetailSummary>
			<div class="detail-grid" id="fileActor-general-grid">
				<div class="text">{{ local.getLabel('fileActor-portrait') || 'Portrait' }}</div
			><CustomBox
				id="fileActor-portrait"
				type="file"
				filter="image"
				:model-value="form.portrait"
				@input="onParamInput" />
			<div class="text">{{ local.getLabel('fileActor-clip') || 'Clip' }}</div
			><CustomBox
				id="fileActor-clip"
				type="clip"
				image="fileActor-portrait"
				:model-value="form.clip"
				@input="onParamInput" />
			<div class="text">{{ local.getLabel('fileActor-animationId') || 'Animation' }}</div
			><CustomBox
				id="fileActor-animationId"
				type="file"
				filter="animation"
				:model-value="form.animationId"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
				<div class="text">Idle Motion</div
				><SelectBox id="fileActor-idleMotion" v-model="form.idleMotion" @input="onParamInput" />
				<div class="text">Move Motion</div
				><SelectBox id="fileActor-moveMotion" v-model="form.moveMotion" @input="onParamInput" />
				<div class="text">Rotatable</div><SelectBox id="fileActor-rotatable" v-model="form.rotatable" @input="onParamInput" />
				<div class="text">Passage Terrain</div
				><SelectBox id="fileActor-passage" v-model="form.passage" @input="onParamInput" />
				<div class="text">Movement Speed</div
				><NumberBox
					id="fileActor-speed"
					v-model="form.speed"
					min="0"
					max="32"
					decimals="4"
					unit="t/s"
					@input="onParamInput" />
				<div class="text">Collision Shape</div
				><SelectBox id="fileActor-shape" v-model="form.shape" @input="onParamInput" />
				<div class="text">Collision Size</div
				><NumberBox
					id="fileActor-size"
					v-model="form.size"
					min="0"
					max="16"
					step="0.1"
					decimals="4"
					unit="t"
					@input="onParamInput" />
				<div class="text">Collision Weight</div
				><NumberBox
					id="fileActor-weight"
					v-model="form.weight"
					min="0"
					max="8"
					step="0.1"
					decimals="4"
					@input="onParamInput" />
				<div class="text">Immovable</div><SelectBox id="fileActor-immovable" v-model="form.immovable" @input="onParamInput" />
				<div class="text">Scale</div
				><NumberBox
					id="fileActor-scale"
					v-model="form.scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput" />
				<div class="text">Priority</div
				><NumberBox
					id="fileActor-priority"
					v-model="form.priority"
					min="-512"
					max="512"
					decimals="4"
					@input="onParamInput" />
				<div class="text">Inherit</div
				><CustomBox
					id="fileActor-inherit"
					type="file"
					filter="actor"
					:model-value="form.inherit"
					@input="onParamInput" />
			</div>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-sprites') || 'Sprites' }}</DetailSummary>
			<ParamList
				id="fileActor-sprites" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-attributes') || 'Attributes' }}</DetailSummary>
			<ParamList
				id="fileActor-attributes" @change="onListChange"
				class="inspector-list"
				group="actor"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-skills') || 'Skills' }}</DetailSummary>
			<ParamList
				id="fileActor-skills" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-equipments') || 'Equipments' }}</DetailSummary>
			<ParamList
				id="fileActor-equipments" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-inventory') || 'Inventory' }}</DetailSummary>
			<ParamList
				id="fileActor-inventory" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-events') || 'Events' }}</DetailSummary>
			<ParamList
				id="fileActor-events" @change="onListChange"
				class="inspector-list"
				filter="actor"
				flexible
			/>
		</DetailBox>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileActor-scripts') || 'Scripts' }}</DetailSummary>
			<ParamList
				id="fileActor-scripts" @change="onListChange"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
		<ParameterPane id="fileActor-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { useFileActorPage } from '@app/composables/useFileActorPage';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const { form, sync, onParamInput } = useFileActorPage();

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.fileActor?.animationIdWrite?.({ value });
};
const onListChange = () => {
	Inspector?.fileActor?.listChange?.();
};

onMounted(() => {
	const el = document.getElementById('fileActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
