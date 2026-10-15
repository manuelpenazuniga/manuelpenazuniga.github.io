<script>
	// Stress test: the same generator with more and more of each case withheld.
	import model from '#lib/data/model.json';
	import { pct } from '#lib/stats.js';

	const s = model.stress;
	const lines = [
		{ key: 'answered', label: 'Cases it answers', tone: 'var(--c-c)', get: (d) => d.answered / d.n },
		{ key: 'right', label: 'Right when it answers', tone: 'var(--c-a)', get: (d) => d.answeredCorrect / d.answered },
		{ key: 'danger', label: 'Dangerous cases flagged', tone: 'var(--c-b)', get: (d) => d.dangerCaught / d.danger }
	];

	let w = $state(560);
	let hover = $state(null);
	const h = 260;
	const m = { l: 40, r: 150, t: 12, b: 36 };
	const right = $derived(w < 480 ? 16 : m.r);
	const x = $derived((v) => m.l + (v / 0.6) * (w - m.l - right));
	const y = (v) => m.t + (1 - (v - 0.3) / 0.7) * (h - m.t - m.b);
	const path = $derived((l) => s.map((d, i) => `${i ? 'L' : 'M'}${x(d.missing)},${y(l.get(d))}`).join(''));
	const yTicks = [0.4, 0.6, 0.8, 1];
</script>

<figure class="figure">
	<h3>What happens when the chart is incomplete</h3>
	<p class="sub">
		Real intake forms arrive half empty. Here 1,500 fresh cases are scored with up to 60% of their fields
		removed. Accuracy on the answers it gives barely moves, because the model answers less instead of
		guessing more. Danger recall is what degrades, which is why it never gets the final word on urgency.
	</p>

	<div class="plot" bind:clientWidth={w}>
		<svg width={w} height={h} role="img" aria-label="Coverage, accuracy and danger recall as fields go missing" onpointerleave={() => (hover = null)}>
			{#each yTicks as t}
				<line class="grid" x1={m.l} x2={w - right} y1={y(t)} y2={y(t)} />
				<text x={m.l - 8} y={y(t) + 4} text-anchor="end">{t * 100}%</text>
			{/each}
			{#each s as d, i}
				<text x={x(d.missing)} y={h - m.b + 16} text-anchor="middle">{d.missing * 100}%</text>
				<rect class="hit" x={x(d.missing) - 18} y={m.t} width="36" height={h - m.t - m.b} onpointerenter={() => (hover = i)} />
			{/each}
			<text x={w - right} y={h - 2} text-anchor="end">fields missing</text>
			{#if hover !== null}
				<line class="cross" x1={x(s[hover].missing)} x2={x(s[hover].missing)} y1={m.t} y2={h - m.b} />
			{/if}
			{#each lines as l}
				<path d={path(l)} fill="none" stroke={l.tone} stroke-width="2" stroke-linejoin="round" />
				{#each s as d, i}
					<circle cx={x(d.missing)} cy={y(l.get(d))} r={hover === i ? 5 : 3.5} fill={l.tone} stroke="var(--surface)" stroke-width="2" />
				{/each}
				{#if right > 16}
					<text class="note" x={w - right + 10} y={y(l.get(s.at(-1))) + 4}>{l.label}</text>
				{/if}
			{/each}
		</svg>
		{#if hover !== null}
			<div class="tip" style="left:{Math.max(90, Math.min(w - 90, x(s[hover].missing)))}px; top:{m.t + 10}px">
				<div class="tip-head">{s[hover].missing * 100}% of fields missing</div>
				<ul>
					{#each lines as l}
						<li><span class="key" style="background:{l.tone}"></span>{l.label}<span class="v">{pct(l.get(s[hover]))}</span></li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>

	<ul class="legend">
		{#each lines as l}
			<li><span class="swatch line" style="background:{l.tone}"></span>{l.label}</li>
		{/each}
	</ul>

	<details class="table">
		<summary>Show the numbers</summary>
		<div class="scroll">
			<table>
				<thead>
					<tr><th scope="col">Missing</th>{#each lines as l}<th scope="col">{l.label}</th>{/each}</tr>
				</thead>
				<tbody>
					{#each s as d}
						<tr><td>{d.missing * 100}%</td>{#each lines as l}<td>{pct(l.get(d))}</td>{/each}</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>
</figure>

<style>
	.hit {
		fill: transparent;
	}
	.cross {
		stroke: var(--line-strong);
	}
</style>
