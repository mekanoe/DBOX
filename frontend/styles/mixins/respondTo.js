const SM = 1200
const LG = 700

export default function respondTo(obj, def = {}) {
	let out = {}
		
	out[`@media (max-width: ${SM - 1}px)`] = obj.sm || def
	out[`@media (min-width: ${SM}px) and (max-width: ${LG - 1}px)`] = obj.md || def
	out[`@media (min-width: ${LG}px)`] = obj.lg || def

	return out
}