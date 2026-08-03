<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('particleLayer-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="particleLayer-general-grid">
			<div class="text">{{ local.getLabel('particleLayer-name') || 'Name' }}</div><TextBox id="particleLayer-name"></TextBox>
			<div class="text">{{ local.getLabel('particleLayer-area-type') || 'Emission Area' }}</div
			><SelectBox id="particleLayer-area-type"></SelectBox> <div class="text">{{ local.getLabel('particleLayer-area-x') || 'X' }}</div
			><NumberBox
				id="particleLayer-area-x"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-area-y') || 'Y' }}</div
			><NumberBox
				id="particleLayer-area-y"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-area-width') || 'Width' }}</div
			><NumberBox
				id="particleLayer-area-width"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-area-height') || 'Height' }}</div
			><NumberBox
				id="particleLayer-area-height"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-area-radius') || 'Radius' }}</div
			><NumberBox
				id="particleLayer-area-radius"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-count') || 'Emission Count' }}</div
			><NumberBox
				id="particleLayer-count"
				min="0"
				max="1000000000"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-delay') || 'Initial Delay' }}</div
			><NumberBox
				id="particleLayer-delay"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-interval') || 'Interval' }}</div
			><NumberBox
				id="particleLayer-interval"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-lifetime') || 'Lifetime' }}</div
			><NumberBox
				id="particleLayer-lifetime"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-lifetimeDev') || 'Lifetime Dev' }}</div
			><NumberBox
				id="particleLayer-lifetimeDev"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-fadeout') || 'Fadeout' }}</div
			><NumberBox
				id="particleLayer-fadeout"
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
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-x-1"
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
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-y-1"
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
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-speedX-1"
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
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-speedY-1"
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
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-angle-1"
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
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-speed-1"
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
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-accelAngle-1"
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
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-accel-1"
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
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-angle-1"
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
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-speed-1"
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
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-accel-1"
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
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-radius-1"
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
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-expansionSpeed-1"
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
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-expansionAccel-1"
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
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angle-1"
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
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angularSpeed-1"
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
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angularAccel-1"
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
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-factor-1"
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
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-speed-1"
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
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-accel-1"
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
			></CustomBox>
			<div class="text">{{ local.getLabel('particleLayer-blend') || 'Blend' }}</div><SelectBox id="particleLayer-blend"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-light') || 'Light Sampling' }}</div
			><SelectBox id="particleLayer-light"></SelectBox> <div class="text">{{ local.getLabel('particleLayer-sort') || 'Sort' }}</div
			><SelectBox id="particleLayer-sort"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-sprite-mode') || 'Sprite Mode' }}</div
			><SelectBox id="particleLayer-sprite-mode"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-sprite-hframes') || 'Horiz Frames' }}</div
			><NumberBox
				id="particleLayer-sprite-hframes"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-sprite-vframes') || 'Vert Frames' }}</div
			><NumberBox
				id="particleLayer-sprite-vframes"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-sprite-interval') || 'Animation Interval' }}</div
			><NumberBox
				id="particleLayer-sprite-interval"
				min="1"
				max="5000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ local.getLabel('particleLayer-color-mode') || 'Color Mode' }}</div
			><SelectBox id="particleLayer-color-mode"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-color-rgba-box') || 'Color' }}</div>
			<div class="flex-box" id="particleLayer-color-rgba-box">
				<NumberBox
					id="particleLayer-color-rgba-0"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-1"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-2"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-3"
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
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-1"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-2"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-3"
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
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-1"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-2"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-3"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-easingId') || 'Color Easing' }}</div
			><SelectBox id="particleLayer-color-easingId"></SelectBox>
			<div class="text">{{ local.getLabel('particleLayer-color-startMin-box') || 'Color Start Min' }}</div>
			<div class="flex-box" id="particleLayer-color-startMin-box">
				<NumberBox
					id="particleLayer-color-startMin-0"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-1"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-2"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-3"
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
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-1"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-2"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-3"
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
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-1"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-2"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-3"
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
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-1"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-2"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-3"
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
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-0"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-tint-1-box') || 'Tint - Green' }}</div>
			<div class="flex-box" id="particleLayer-color-tint-1-box">
				<SliderBox
					id="particleLayer-color-tint-1-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-1"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-tint-2-box') || 'Tint - Blue' }}</div>
			<div class="flex-box" id="particleLayer-color-tint-2-box">
				<SliderBox
					id="particleLayer-color-tint-2-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-2"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('particleLayer-color-tint-3-box') || 'Tint - Grayscale' }}</div>
			<div class="flex-box" id="particleLayer-color-tint-3-box">
				<SliderBox
					id="particleLayer-color-tint-3-slider"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-3"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useParticleStore } from '@app/stores/particle';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const particle = useParticleStore();
const local = useLocalStore();

onMounted(() => {
	particle.syncState();
	local.syncState();
});
</script>
