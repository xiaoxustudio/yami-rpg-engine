<template>
	<WindowFrame id="setObjectAnimation" @confirm="onConfirm">
		<template #title><TitleBar>Set Object Animation<div class="close" /></TitleBar></template>
		
			<div class="grid-box" id="setObjectAnimation-grid-box">
				<div class="text">Sort</div><SelectBox id="setObjectAnimation-sort" />
				<div class="text">Actor</div><CustomBox id="setObjectAnimation-actor" type="actor" />
				<div class="text">Trigger</div
				><CustomBox id="setObjectAnimation-trigger" type="trigger" />
				<div class="text">Animation</div
				><CustomBox id="setObjectAnimation-animation" type="object" />
				<div class="text">Operation</div><SelectBox id="setObjectAnimation-operation" />
				<div class="text">Tint - Red</div
				><NumberBox id="setObjectAnimation-tint-0" min="-255" max="255" step="5" />
				<div class="text">Tint - Green</div
				><NumberBox id="setObjectAnimation-tint-1" min="-255" max="255" step="5" />
				<div class="text">Tint - Blue</div
				><NumberBox id="setObjectAnimation-tint-2" min="-255" max="255" step="5" />
				<div class="text">Tint - Grayscale</div
				><NumberBox id="setObjectAnimation-tint-3" min="0" max="255" step="5" />
				<div class="text">Opacity</div
				><NumberVar
					id="setObjectAnimation-opacity"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				 />
				<div class="text">OffsetY</div
				><NumberVar
					id="setObjectAnimation-offsetY"
					min="-10000"
					max="10000"
					step="1"
					decimals="4"
				 />
				<div class="text">Rotation</div
				><NumberVar
					id="setObjectAnimation-rotation"
					min="-10000"
					max="10000"
					step="1"
					decimals="4"
				 />
				<div class="text">Easing</div
				><SelectBox id="setObjectAnimation-easingId" name="easing" />
				<div class="text">Duration</div
				><NumberBox
					id="setObjectAnimation-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<div class="text">Wait</div><SelectBox id="setObjectAnimation-wait" name="wait" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setObjectAnimation?.save?.();
};

</script>
