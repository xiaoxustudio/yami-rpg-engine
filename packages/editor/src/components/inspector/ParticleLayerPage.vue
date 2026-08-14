<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('particleLayer-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="particleLayer-general-grid">
			<div class="text">{{ local.getLabel('particleLayer-name') || 'Name' }}</div><TextBox id="particleLayer-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('particleLayer-area-type') || 'Emission Area' }}</div
			><SelectBox id="particleLayer-area-type" v-model="form.area.type" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('particleLayer-area-x') || 'X' }}</div
			><NumberBox
				id="particleLayer-area-x"
				v-model="form.area.x" @input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-area-y') || 'Y' }}</div
			><NumberBox
				id="particleLayer-area-y"
				v-model="form.area.y" @input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-area-width') || 'Width' }}</div
			><NumberBox
				id="particleLayer-area-width"
				v-model="form.area.width" @input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-area-height') || 'Height' }}</div
			><NumberBox
				id="particleLayer-area-height"
				v-model="form.area.height" @input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-area-radius') || 'Radius' }}</div
			><NumberBox
				id="particleLayer-area-radius"
				v-model="form.area.radius" @input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-count') || 'Emission Count' }}</div
			><NumberBox
				id="particleLayer-count"
				v-model="form.count" @input="onParamInput"
				min="0"
				max="1000000000"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-delay') || 'Initial Delay' }}</div
			><NumberBox
				id="particleLayer-delay"
				v-model="form.delay" @input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-interval') || 'Interval' }}</div
			><NumberBox
				id="particleLayer-interval"
				v-model="form.interval" @input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-lifetime') || 'Lifetime' }}</div
			><NumberBox
				id="particleLayer-lifetime"
				v-model="form.lifetime" @input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-lifetimeDev') || 'Lifetime Dev' }}</div
			><NumberBox
				id="particleLayer-lifetimeDev"
				v-model="form.lifetimeDev" @input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-fadeout') || 'Fadeout' }}</div
			><NumberBox
				id="particleLayer-fadeout"
				v-model="form.fadeout" @input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('particleLayer-anchor-grid') || 'Anchor' }}</DetailSummary>
		<div class="detail-grid" id="particleLayer-anchor-grid">
			<div class="text">{{ local.getLabel('particleLayer-anchor-x-box') || 'Anchor X' }}</div>
			<div class="flex-box" id="particleLayer-anchor-x-box">
				<NumberBox
					id="particleLayer-anchor-x-0"
					v-model="form.anchor.x[0]" @input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-x-1"
					v-model="form.anchor.x[1]" @input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-anchor-y-box') || 'Anchor Y' }}</div>
			<div class="flex-box" id="particleLayer-anchor-y-box">
				<NumberBox
					id="particleLayer-anchor-y-0"
					v-model="form.anchor.y[0]" @input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-y-1"
					v-model="form.anchor.y[1]" @input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-anchor-speedX-box') || 'Anchor Speed X' }}</div>
			<div class="flex-box" id="particleLayer-anchor-speedX-box">
				<NumberBox
					id="particleLayer-anchor-speedX-0"
					v-model="form.anchor.speedX[0]" @input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-speedX-1"
					v-model="form.anchor.speedX[1]" @input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-anchor-speedY-box') || 'Anchor Speed Y' }}</div>
			<div class="flex-box" id="particleLayer-anchor-speedY-box">
				<NumberBox
					id="particleLayer-anchor-speedY-0"
					v-model="form.anchor.speedY[0]" @input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-speedY-1"
					v-model="form.anchor.speedY[1]" @input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('particleLayer-movement-grid') || 'Movement' }}</DetailSummary>
		<div class="detail-grid" id="particleLayer-movement-grid">
			<div class="text">{{ local.getLabel('particleLayer-movement-angle-box') || 'Movement Angle' }}</div>
			<div class="flex-box" id="particleLayer-movement-angle-box">
				<NumberBox
					id="particleLayer-movement-angle-0"
					v-model="form.movement.angle[0]" @input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-angle-1"
					v-model="form.movement.angle[1]" @input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-movement-speed-box') || 'Movement Speed' }}</div>
			<div class="flex-box" id="particleLayer-movement-speed-box">
				<NumberBox
					id="particleLayer-movement-speed-0"
					v-model="form.movement.speed[0]" @input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-speed-1"
					v-model="form.movement.speed[1]" @input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-movement-accelAngle-box') || 'Accel Angle' }}</div>
			<div class="flex-box" id="particleLayer-movement-accelAngle-box">
				<NumberBox
					id="particleLayer-movement-accelAngle-0"
					v-model="form.movement.accelAngle[0]" @input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-accelAngle-1"
					v-model="form.movement.accelAngle[1]" @input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-movement-accel-box') || 'Accel' }}</div>
			<div class="flex-box" id="particleLayer-movement-accel-box">
				<NumberBox
					id="particleLayer-movement-accel-0"
					v-model="form.movement.accel[0]" @input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-accel-1"
					v-model="form.movement.accel[1]" @input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('particleLayer-rotation-grid') || 'Rotation' }}</DetailSummary>
		<div class="detail-grid" id="particleLayer-rotation-grid">
			<div class="text">{{ local.getLabel('particleLayer-rotation-angle-box') || 'Rotation Angle' }}</div>
			<div class="flex-box" id="particleLayer-rotation-angle-box">
				<NumberBox
					id="particleLayer-rotation-angle-0"
					v-model="form.rotation.angle[0]" @input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-angle-1"
					v-model="form.rotation.angle[1]" @input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-rotation-speed-box') || 'Angular Velocity' }}</div>
			<div class="flex-box" id="particleLayer-rotation-speed-box">
				<NumberBox
					id="particleLayer-rotation-speed-0"
					v-model="form.rotation.speed[0]" @input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-speed-1"
					v-model="form.rotation.speed[1]" @input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-rotation-accel-box') || 'Angular Accel' }}</div>
			<div class="flex-box" id="particleLayer-rotation-accel-box">
				<NumberBox
					id="particleLayer-rotation-accel-0"
					v-model="form.rotation.accel[0]" @input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-accel-1"
					v-model="form.rotation.accel[1]" @input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('particleLayer-hRotation-grid') || 'Horizontal Rotation' }}</DetailSummary>
		<div class="detail-grid" id="particleLayer-hRotation-grid">
			<div class="text">{{ local.getLabel('particleLayer-hRotation-radius-box') || 'Initial Radius' }}</div>
			<div class="flex-box" id="particleLayer-hRotation-radius-box">
				<NumberBox
					id="particleLayer-hRotation-radius-0"
					v-model="form.hRotation.radius[0]" @input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-radius-1"
					v-model="form.hRotation.radius[1]" @input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					unit="px"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-hRotation-expansionSpeed-box') || 'Expansion Speed' }}</div>
			<div class="flex-box" id="particleLayer-hRotation-expansionSpeed-box">
				<NumberBox
					id="particleLayer-hRotation-expansionSpeed-0"
					v-model="form.hRotation.expansionSpeed[0]" @input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-expansionSpeed-1"
					v-model="form.hRotation.expansionSpeed[1]" @input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-hRotation-expansionAccel-box') || 'Expansion Accel' }}</div>
			<div class="flex-box" id="particleLayer-hRotation-expansionAccel-box">
				<NumberBox
					id="particleLayer-hRotation-expansionAccel-0"
					v-model="form.hRotation.expansionAccel[0]" @input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-expansionAccel-1"
					v-model="form.hRotation.expansionAccel[1]" @input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-hRotation-angle-box') || 'Rotation Angle' }}</div>
			<div class="flex-box" id="particleLayer-hRotation-angle-box">
				<NumberBox
					id="particleLayer-hRotation-angle-0"
					v-model="form.hRotation.angle[0]" @input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angle-1"
					v-model="form.hRotation.angle[1]" @input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-hRotation-angularSpeed-box') || 'Angular Velocity' }}</div>
			<div class="flex-box" id="particleLayer-hRotation-angularSpeed-box">
				<NumberBox
					id="particleLayer-hRotation-angularSpeed-0"
					v-model="form.hRotation.angularSpeed[0]" @input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angularSpeed-1"
					v-model="form.hRotation.angularSpeed[1]" @input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-hRotation-angularAccel-box') || 'Angular Accel' }}</div>
			<div class="flex-box" id="particleLayer-hRotation-angularAccel-box">
				<NumberBox
					id="particleLayer-hRotation-angularAccel-0"
					v-model="form.hRotation.angularAccel[0]" @input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angularAccel-1"
					v-model="form.hRotation.angularAccel[1]" @input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('particleLayer-scale-grid') || 'Scale' }}</DetailSummary>
		<div class="detail-grid" id="particleLayer-scale-grid">
			<div class="text">{{ local.getLabel('particleLayer-scale-factor-box') || 'Scale Factor' }}</div>
			<div class="flex-box" id="particleLayer-scale-factor-box">
				<NumberBox
					id="particleLayer-scale-factor-0"
					v-model="form.scale.factor[0]" @input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-factor-1"
					v-model="form.scale.factor[1]" @input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-scale-speed-box') || 'Expansion Speed' }}</div>
			<div class="flex-box" id="particleLayer-scale-speed-box">
				<NumberBox
					id="particleLayer-scale-speed-0"
					v-model="form.scale.speed[0]" @input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-speed-1"
					v-model="form.scale.speed[1]" @input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-scale-accel-box') || 'Expansion Accel' }}</div>
			<div class="flex-box" id="particleLayer-scale-accel-box">
				<NumberBox
					id="particleLayer-scale-accel-0"
					v-model="form.scale.accel[0]" @input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-accel-1"
					v-model="form.scale.accel[1]" @input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('particleLayer-rendering-grid') || 'Rendering' }}</DetailSummary>
		<div class="detail-grid" id="particleLayer-rendering-grid">
			<div class="text">{{ local.getLabel('particleLayer-image') || 'Image' }}</div
			><CustomBox
				id="particleLayer-image"
				type="file"
				filter="image"
				:model-value="form.image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('particleLayer-blend') || 'Blend' }}</div><SelectBox id="particleLayer-blend" v-model="form.blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-light') || 'Light Sampling' }}</div
			><SelectBox id="particleLayer-light" v-model="form.light" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('particleLayer-sort') || 'Sort' }}</div
			><SelectBox id="particleLayer-sort" v-model="form.sort" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-sprite-mode') || 'Sprite Mode' }}</div
			><SelectBox id="particleLayer-sprite-mode" v-model="form.sprite.mode" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-sprite-hframes') || 'Horiz Frames' }}</div
			><NumberBox
				id="particleLayer-sprite-hframes"
				v-model="form.sprite.hframes" @input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-sprite-vframes') || 'Vert Frames' }}</div
			><NumberBox
				id="particleLayer-sprite-vframes"
				v-model="form.sprite.vframes" @input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-sprite-interval') || 'Animation Interval' }}</div
			><NumberBox
				id="particleLayer-sprite-interval"
				v-model="form.sprite.interval" @input="onParamInput"
				min="1"
				max="5000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-color-mode') || 'Color Mode' }}</div
			><SelectBox id="particleLayer-color-mode" v-model="form.color.mode" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-color-rgba-box') || 'Color' }}</div>
			<div class="flex-box" id="particleLayer-color-rgba-box">
				<NumberBox
					id="particleLayer-color-rgba-0"
					v-model="form.color.rgba[0]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-1"
					v-model="form.color.rgba[1]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-2"
					v-model="form.color.rgba[2]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-3"
					v-model="form.color.rgba[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-min-box') || 'Color Min' }}</div>
			<div class="flex-box" id="particleLayer-color-min-box">
				<NumberBox
					id="particleLayer-color-min-0"
					v-model="form.color.min[0]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-1"
					v-model="form.color.min[1]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-2"
					v-model="form.color.min[2]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-3"
					v-model="form.color.min[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-max-box') || 'Color Max' }}</div>
			<div class="flex-box" id="particleLayer-color-max-box">
				<NumberBox
					id="particleLayer-color-max-0"
					v-model="form.color.max[0]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-1"
					v-model="form.color.max[1]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-2"
					v-model="form.color.max[2]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-3"
					v-model="form.color.max[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-easingId') || 'Color Easing' }}</div
			><SelectBox id="particleLayer-color-easingId" v-model="form.color.easingId" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-color-startMin-box') || 'Color Start Min' }}</div>
			<div class="flex-box" id="particleLayer-color-startMin-box">
				<NumberBox
					id="particleLayer-color-startMin-0"
					v-model="form.color.startMin[0]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-1"
					v-model="form.color.startMin[1]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-2"
					v-model="form.color.startMin[2]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-3"
					v-model="form.color.startMin[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-startMax-box') || 'Color Start Max' }}</div>
			<div class="flex-box" id="particleLayer-color-startMax-box">
				<NumberBox
					id="particleLayer-color-startMax-0"
					v-model="form.color.startMax[0]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-1"
					v-model="form.color.startMax[1]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-2"
					v-model="form.color.startMax[2]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-3"
					v-model="form.color.startMax[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-endMin-box') || 'Color End Min' }}</div>
			<div class="flex-box" id="particleLayer-color-endMin-box">
				<NumberBox
					id="particleLayer-color-endMin-0"
					v-model="form.color.endMin[0]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-1"
					v-model="form.color.endMin[1]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-2"
					v-model="form.color.endMin[2]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-3"
					v-model="form.color.endMin[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-endMax-box') || 'Color End Max' }}</div>
			<div class="flex-box" id="particleLayer-color-endMax-box">
				<NumberBox
					id="particleLayer-color-endMax-0"
					v-model="form.color.endMax[0]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-1"
					v-model="form.color.endMax[1]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-2"
					v-model="form.color.endMax[2]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-3"
					v-model="form.color.endMax[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-tint-0-box') || 'Tint - Red' }}</div>
			<div class="flex-box" id="particleLayer-color-tint-0-box">
				<SliderBox
					id="particleLayer-color-tint-0-slider"
					v-model="form.color.tint[0]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-0"
					v-model="form.color.tint[0]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-tint-1-box') || 'Tint - Green' }}</div>
			<div class="flex-box" id="particleLayer-color-tint-1-box">
				<SliderBox
					id="particleLayer-color-tint-1-slider"
					v-model="form.color.tint[1]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-1"
					v-model="form.color.tint[1]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-tint-2-box') || 'Tint - Blue' }}</div>
			<div class="flex-box" id="particleLayer-color-tint-2-box">
				<SliderBox
					id="particleLayer-color-tint-2-slider"
					v-model="form.color.tint[2]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-2"
					v-model="form.color.tint[2]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-tint-3-box') || 'Tint - Grayscale' }}</div>
			<div class="flex-box" id="particleLayer-color-tint-3-box">
				<SliderBox
					id="particleLayer-color-tint-3-slider"
					v-model="form.color.tint[3]"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-3"
					v-model="form.color.tint[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useParticleStore } from '@app/stores/particle';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

interface ParticleForm {
	name: string;
	area: {
		type: string;
		x: number;
		y: number;
		width: number;
		height: number;
		radius: number;
	};
	count: number;
	delay: number;
	interval: number;
	lifetime: number;
	lifetimeDev: number;
	fadeout: number;
	anchor: {
		x: number[];
		y: number[];
		speedX: number[];
		speedY: number[];
	};
	movement: {
		angle: number[];
		speed: number[];
		accelAngle: number[];
		accel: number[];
	};
	rotation: {
		angle: number[];
		speed: number[];
		accel: number[];
	};
	hRotation: {
		radius: number[];
		expansionSpeed: number[];
		expansionAccel: number[];
		angle: number[];
		angularSpeed: number[];
		angularAccel: number[];
	};
	scale: {
		factor: number[];
		speed: number[];
		accel: number[];
	};
	image: string;
	blend: string;
	light: string;
	sort: string;
	sprite: {
		mode: string;
		hframes: number;
		vframes: number;
		interval: number;
	};
	color: {
		mode: string;
		rgba: number[];
		min: number[];
		max: number[];
		easingId: string;
		startMin: number[];
		startMax: number[];
		endMin: number[];
		endMax: number[];
		tint: number[];
	};
}

const SIMPLE_KEYS: (keyof ParticleForm)[] = [
	'name',
	'count',
	'delay',
	'interval',
	'lifetime',
	'lifetimeDev',
	'fadeout',
	'image',
	'blend',
	'light',
	'sort'
];

const particle = useParticleStore();
const local = useLocalStore();

const form = reactive<ParticleForm>({
	name: '',
	area: { type: 'point', x: 0, y: 0, width: 64, height: 64, radius: 32 },
	count: 0,
	delay: 0,
	interval: 40,
	lifetime: 1000,
	lifetimeDev: 0,
	fadeout: 200,
	anchor: { x: [0, 0], y: [0, 0], speedX: [0, 0], speedY: [0, 0] },
	movement: { angle: [0, 0], speed: [0, 0], accelAngle: [0, 0], accel: [0, 0] },
	rotation: { angle: [0, 0], speed: [0, 0], accel: [0, 0] },
	hRotation: {
		radius: [0, 0],
		expansionSpeed: [0, 0],
		expansionAccel: [0, 0],
		angle: [0, 0],
		angularSpeed: [0, 0],
		angularAccel: [0, 0]
	},
	scale: { factor: [1, 1], speed: [0, 0], accel: [0, 0] },
	image: '',
	blend: 'additive',
	light: 'raw',
	sort: 'youngest-in-front',
	sprite: { mode: 'random', hframes: 1, vframes: 1, interval: 100 },
	color: {
		mode: 'texture',
		rgba: [255, 255, 255, 255],
		min: [0, 0, 0, 255],
		max: [255, 255, 255, 255],
		easingId: '',
		startMin: [0, 0, 0, 255],
		startMax: [255, 255, 255, 255],
		endMin: [0, 0, 0, 255],
		endMax: [255, 255, 255, 255],
		tint: [0, 0, 0, 0]
	}
});

const sync = (): void => {
	const target = Inspector?.particleLayer?.target as Partial<ParticleForm> | null | undefined;
	if (!target) return;
	for (const key of SIMPLE_KEYS) {
		const value = target[key];
		if (value !== undefined) {
			form[key] = value;
		}
	}
	form.area = {
		type: target.area?.type ?? 'point',
		x: target.area?.x ?? 0,
		y: target.area?.y ?? 0,
		width: target.area?.width ?? 64,
		height: target.area?.height ?? 64,
		radius: target.area?.radius ?? 32
	};
	form.anchor = {
		x: [target.anchor?.x?.[0] ?? 0, target.anchor?.x?.[1] ?? 0],
		y: [target.anchor?.y?.[0] ?? 0, target.anchor?.y?.[1] ?? 0],
		speedX: [target.anchor?.speedX?.[0] ?? 0, target.anchor?.speedX?.[1] ?? 0],
		speedY: [target.anchor?.speedY?.[0] ?? 0, target.anchor?.speedY?.[1] ?? 0]
	};
	form.movement = {
		angle: [target.movement?.angle?.[0] ?? 0, target.movement?.angle?.[1] ?? 0],
		speed: [target.movement?.speed?.[0] ?? 0, target.movement?.speed?.[1] ?? 0],
		accelAngle: [target.movement?.accelAngle?.[0] ?? 0, target.movement?.accelAngle?.[1] ?? 0],
		accel: [target.movement?.accel?.[0] ?? 0, target.movement?.accel?.[1] ?? 0]
	};
	form.rotation = {
		angle: [target.rotation?.angle?.[0] ?? 0, target.rotation?.angle?.[1] ?? 0],
		speed: [target.rotation?.speed?.[0] ?? 0, target.rotation?.speed?.[1] ?? 0],
		accel: [target.rotation?.accel?.[0] ?? 0, target.rotation?.accel?.[1] ?? 0]
	};
	form.hRotation = {
		radius: [target.hRotation?.radius?.[0] ?? 0, target.hRotation?.radius?.[1] ?? 0],
		expansionSpeed: [
			target.hRotation?.expansionSpeed?.[0] ?? 0,
			target.hRotation?.expansionSpeed?.[1] ?? 0
		],
		expansionAccel: [
			target.hRotation?.expansionAccel?.[0] ?? 0,
			target.hRotation?.expansionAccel?.[1] ?? 0
		],
		angle: [target.hRotation?.angle?.[0] ?? 0, target.hRotation?.angle?.[1] ?? 0],
		angularSpeed: [
			target.hRotation?.angularSpeed?.[0] ?? 0,
			target.hRotation?.angularSpeed?.[1] ?? 0
		],
		angularAccel: [
			target.hRotation?.angularAccel?.[0] ?? 0,
			target.hRotation?.angularAccel?.[1] ?? 0
		]
	};
	form.scale = {
		factor: [target.scale?.factor?.[0] ?? 1, target.scale?.factor?.[1] ?? 1],
		speed: [target.scale?.speed?.[0] ?? 0, target.scale?.speed?.[1] ?? 0],
		accel: [target.scale?.accel?.[0] ?? 0, target.scale?.accel?.[1] ?? 0]
	};
	form.sprite = {
		mode: target.sprite?.mode ?? 'random',
		hframes: target.sprite?.hframes ?? 1,
		vframes: target.sprite?.vframes ?? 1,
		interval: target.sprite?.interval ?? 100
	};
	form.color = {
		mode: target.color?.mode ?? 'texture',
		rgba: [target.color?.rgba?.[0] ?? 255, target.color?.rgba?.[1] ?? 255, target.color?.rgba?.[2] ?? 255, target.color?.rgba?.[3] ?? 255],
		min: [target.color?.min?.[0] ?? 0, target.color?.min?.[1] ?? 0, target.color?.min?.[2] ?? 0, target.color?.min?.[3] ?? 255],
		max: [target.color?.max?.[0] ?? 255, target.color?.max?.[1] ?? 255, target.color?.max?.[2] ?? 255, target.color?.max?.[3] ?? 255],
		easingId: target.color?.easingId ?? (Inspector?.particleLayer?.easingDefaultId as string | undefined) ?? '',
		startMin: [target.color?.startMin?.[0] ?? 0, target.color?.startMin?.[1] ?? 0, target.color?.startMin?.[2] ?? 0, target.color?.startMin?.[3] ?? 255],
		startMax: [target.color?.startMax?.[0] ?? 255, target.color?.startMax?.[1] ?? 255, target.color?.startMax?.[2] ?? 255, target.color?.startMax?.[3] ?? 255],
		endMin: [target.color?.endMin?.[0] ?? 0, target.color?.endMin?.[1] ?? 0, target.color?.endMin?.[2] ?? 0, target.color?.endMin?.[3] ?? 255],
		endMax: [target.color?.endMax?.[0] ?? 255, target.color?.endMax?.[1] ?? 255, target.color?.endMax?.[2] ?? 255, target.color?.endMax?.[3] ?? 255],
		tint: [target.color?.tint?.[0] ?? 0, target.color?.tint?.[1] ?? 0, target.color?.tint?.[2] ?? 0, target.color?.tint?.[3] ?? 0]
	};
};

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.particleLayer?.paramInput?.({ target });
	sync();
};

onMounted(() => {
	const el = document.getElementById('particleLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
	particle.syncState();
	local.syncState();
});
</script>
