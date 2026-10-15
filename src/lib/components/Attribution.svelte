<script>
	// SHAP summary for the danger gate: one dot per case per feature. Right of
	// zero pushes the case toward "dangerous", left pushes it toward benign.
	import model from '#lib/data/model.json';
	import { featureLabel } from '#lib/stats.js';

	const a = model.attribution;
	const n = a.danger.length;
	const groups = [
		{ v: 0, label: 'Truly peripheral', tone: 'var(--c-a)' },
		{ v: 1, label: 'Truly dangerous', tone: 'var(--c-b)' }
	];

	// seeded jitter scaled by local density, so each row reads as a violin of dots
	let seed = 7;
	const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
	const lo = Math.floor(Math.min(...a.values.flat()));
	const hi = Math.ceil(Math.max(...a.values.flat()));
	const BINS = 60;
	const rows = a.features.map((f, r) => {
		const vals = a.values[r];
		const hist = new Array(BINS).fill(0);
		const bin = (v) => Math.min(BINS - 1, Math.floor(((v - lo) / (hi - lo)) * BINS));
		vals.forEach((v) => hist[bin(v)]++);
		const peak = Math.max(...hist);
		const dots = vals
			.map((v, i) => ({ v, i, j: (rand() - 0.5) * Math.sqrt(hist[bin(v)] / peak) }))
			.sort((p, q) => a.danger[p.i] - a.danger[q.i]);
		return { f, risk: a.risk[r], mean: a.meanAbs[r], dots };
	});

	let w = $state(640);
	let hover = $state(null);
	// on narrow screens each feature name sits above its row instead of beside it
	const narrow = $derived(w < 520);
	const label = $derived(narrow ? 4 : 178);
	const rowH = $derived(narrow ? 46 : 34);
	const top = $derived(narrow ? 14 : 0);
	const m = { t: 8, b: 40 };
	const h = $derived(rows.length * rowH + m.t + m.b);
	const x = $derived((v) => label + ((v - lo) / (hi - lo)) * (w - label - 12));
	const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((t) => t % 2 === 0);
</script>

<figure class="figure">
	<h3>What actually moves the danger gate</h3>
	<p class="sub">
		Exact TreeSHAP on the gate’s log-odds for {n} held-out cases, features ranked by mean absolute
		effect. Vascular risk and age dominate, as they should, since posterior-circulation stroke is the
		danger this gate exists for. Marked features carry a monotone constraint: more risk can never lower
		the probability of danger, by construction rather than by luck.
	</p>

	<div class="plot" bind:clientWidth={w}>
		<svg width={w} height={h} role="img" aria-label="SHAP values of the eight most influential features for the danger gate" onpointerleave={() => (hover = null)}>
			{#each ticks as t}
				<line class={t === 0 ? 'zero' : 'grid'} x1={x(t)} x2={x(t)} y1={m.t} y2={h - m.b} />
				<text x={x(t)} y={h - m.b + 16} text-anchor="middle">{t > 0 ? '+' : ''}{t}</text>
			{/each}
			{#if !narrow}<text x={x(lo)} y={h - 4}>← toward benign</text>{/if}
			<text x={w - 12} y={h - 4} text-anchor="end">toward dangerous, log-odds →</text>
			{#each rows as row, r}
				{@const cy = m.t + r * rowH + (rowH + top) / 2}
				<text class="feat" x="0" y={narrow ? cy - 16 : cy + 4}>{row.risk ? '◆ ' : ''}{featureLabel[row.f] ?? row.f}</text>
				{#each row.dots as d}
					<circle
						cx={x(d.v)}
						cy={cy + d.j * (rowH - top - 6)}
						r="2.4"
						fill={groups[a.danger[d.i]].tone}
						onpointerenter={() => (hover = { r, cy, d, row })}
					/>
				{/each}
			{/each}
		</svg>
		{#if hover}
			<div class="tip" style="left:{Math.max(90, Math.min(w - 90, x(hover.d.v)))}px; top:{hover.cy - 6}px">
				<div class="tip-head">{featureLabel[hover.row.f] ?? hover.row.f}</div>
				<strong>{hover.d.v > 0 ? '+' : ''}{hover.d.v.toFixed(2)}</strong> log-odds<br />
				{groups[a.danger[hover.d.i]].label.toLowerCase()} case
			</div>
		{/if}
	</div>

	<ul class="legend">
		{#each groups as g}
			<li><span class="swatch dot" style="background:{g.tone}"></span>{g.label}</li>
		{/each}
		<li>◆ Monotone risk feature</li>
	</ul>

	<details class="table">
		<summary>Show the numbers</summary>
		<div class="scroll">
			<table>
				<thead><tr><th scope="col">Feature</th><th scope="col">Mean |SHAP|</th><th scope="col">Monotone</th></tr></thead>
				<tbody>
					{#each rows as row}
						<tr><td>{featureLabel[row.f] ?? row.f}</td><td>{row.mean.toFixed(3)}</td><td>{row.risk ? 'yes' : ''}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>
</figure>

<style>
	.feat {
		fill: var(--ink-2);
		font-size: 12.5px;
	}
	.zero {
		stroke: var(--line-strong);
		stroke-width: 1.5;
	}
	circle {
		opacity: 0.8;
	}
	circle:hover {
		opacity: 1;
		stroke: var(--ink);
		stroke-width: 1.5;
	}
</style>
