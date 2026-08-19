export function clamp(number: number, minimum: number, maximum: number): number {
	return Math.min(Math.max(number, minimum), maximum);
}

export function roundTo(number: number, decimalPlaces: number): number {
	const factor = Math.pow(10, decimalPlaces);
	return Math.round(number * factor) / factor;
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

export function randomBetween(value1: number, value2: number): number {
	return value1 + Math.random() * (value2 - value1);
}

export function radians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

export function degrees(radians: number): number {
	return (radians * 180) / Math.PI;
}

export function modDegrees(degrees: number, period = 360): number {
	return ((degrees % period) + period) % period;
}

export function modRadians(radians: number, period = Math.PI * 2): number {
	return ((radians % period) + period) % period;
}

Math.clamp = clamp;
Math.roundTo = roundTo;
Math.dist = dist;
Math.randomBetween = randomBetween;
Math.radians = radians;
Math.degrees = degrees;
Math.modDegrees = modDegrees;
Math.modRadians = modRadians;
