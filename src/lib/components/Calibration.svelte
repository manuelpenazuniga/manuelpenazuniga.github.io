<script>
	// Reliability diagram: when the model says 90%, is it right 90% of the time?
	import model from '#lib/data/model.json';
	import { wilson, pct } from '#lib/stats.js';

	const { cases } = model;
	const n = cases.y.length;
	const BINS = 15; // the same binning Clinibrium's own ECE uses

	function reliability(conf, pred) {
		const bins = Array.from({ length: BINS }, (_, i) => ({ lo: i / BINS, hi: (i + 1) / BINS, n: 0, hit: 0, sum: 0 }));
		conf.forEach((c, i) => {
			const b = bins[Math.min(BINS - 1, Math.max(0, Math.ceil(c * BINS) - 1))];
			b.n++;
			b.sum += c;
			b.hit += pred[i] === cases.y[i];
		});
		const filled = bins
			.filter((b) => b.n)
			.map((b) => ({ ...b, conf: b.sum / b.n, acc: b.hit / b.n, ci: wilson(b.hit, b.n) }));
		return { bins: filled, ece: filled.reduce((a, b) => a + (b.n / n) * Math.abs(b.acc - b.conf), 0) };
	}

	const panels = [
		{ key: 'raw', title: 'Raw scores', tone: 'var(--c-a)', ...reliability(cases.rawConf, cases.rawPred) },
		{
			key: 'cal',
			title: `After temperature scaling, T = ${model.temperature.toFixed(2)}`,
			tone: 'var(--c-b)',
			...reliability(cases.conf, cases.pred)
		}
	];

	const lo = 0;
	const ticks = [0.25, 0.5, 0.75, 1];
	const m = { l: 40, r: 14, t: 14, b: 34 };

	let w = $state(320);
	let hover = $state(null);
	const size = $derived(Math.min(w, 380));
	const inner = $derived(size - m.l - m.r);
	const x = $derived((v) => m.l + ((v - lo) / (1 - lo)) * inner);
	const y = $derived((v) => m.t + (1 - (v - lo) / (1 - lo)) * inner);
	const r = (b) => 3 + 9 * Math.sqrt(b.n / n);
</script>

<figure class="figure">
	<h3>Does 90% sure mean right 90% of the time?</h3>
	<p class="sub">
		Each dot is a band of confidence; its height is how often the model was right there, and its area
		is how many of the {n.toLocaleString('en-US')} held-out cases fall in it. Bars are 95% Wilson intervals, wide where few cases fall.
		On the diagonal, the stated confidence can be taken literally. Temperature scaling lowers the
		log-loss it is fitted on, yet here it raises the calibration error slightly. The model card reports
		that instead of hiding it.
	</p>

	<div class="pair">
		{#each panels as p, pi}
			<div class="panel">
				<h4><span class="swatch dot" style="background:{p.tone}"></span>{p.title}</h4>
				<p class="ece">Expected calibration error <strong>{p.ece.toFixed(4)}</strong></p>
				{#if pi === 0}
					<div class="measure" bind:clientWidth={w}></div>
				{/if}
				<div class="plot" style="width:{size}px">
					<svg
						width={size}
						height={size}
						role="img"
						aria-label="Reliability diagram, {p.title}: accuracy against confidence"
						onpointerleave={() => (hover = null)}
					>
						{#each ticks as t}
							<line class="grid" x1={x(lo)} x2={x(1)} y1={y(t)} y2={y(t)} />
							<line class="grid" x1={x(t)} x2={x(t)} y1={y(lo)} y2={y(1)} />
							<text x={m.l - 8} y={y(t) + 4} text-anchor="end">{t * 100}%</text>
							<text x={x(t)} y={size - m.b + 16} text-anchor="middle">{t * 100}%</text>
						{/each}
						<line class="axis" x1={x(lo)} x2={x(1)} y1={y(lo)} y2={y(lo)} />
						<text x={m.l - 8} y={y(0) + 4} text-anchor="end">0%</text>
						<line class="diag" x1={x(lo)} y1={y(lo)} x2={x(1)} y2={y(1)} />
						<text class="note" x={x(0.18)} y={y(0.18) - 8} transform="rotate(-45 {x(0.18)} {y(0.18) - 8})" text-anchor="middle">
							perfectly calibrated
						</text>
						<text x={x(1)} y={size - 2} text-anchor="end">stated confidence</text>
						{#each p.bins as b}
							<line class="ci" x1={x(b.conf)} x2={x(b.conf)} y1={y(b.ci[0])} y2={y(b.ci[1])} stroke={p.tone} />
							<circle
								class="dot"
								class:on={hover && hover.p === pi && hover.b === b}
								cx={x(b.conf)}
								cy={y(b.acc)}
								r={r(b)}
								fill={p.tone}
							/>
							<circle
								class="hit"
								cx={x(b.conf)}
								cy={y(b.acc)}
								r={Math.max(12, r(b))}
								onpointerenter={() => (hover = { p: pi, b })}
							/>
						{/each}
					</svg>
					{#if hover && hover.p === pi}
						<div class="tip" style="left:{Math.max(96, Math.min(size - 96, x(hover.b.conf)))}px; top:{y(hover.b.acc) - r(hover.b)}px">
							<div class="tip-head">Confidence {pct(hover.b.lo, 0)} to {pct(hover.b.hi, 0)}</div>
							<strong>{pct(hover.b.acc)}</strong> right, of {hover.b.n} cases<br />
							95% interval {pct(hover.b.ci[0], 0)} to {pct(hover.b.ci[1], 0)}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<details class="table">
		<summary>Show the numbers</summary>
		<div class="scroll">
			<table>
				<thead>
					<tr>
						<th scope="col">Confidence band</th>
						{#each panels as p}
							<th scope="col">{p.key === 'raw' ? 'Raw' : 'Scaled'}: cases</th>
							<th scope="col">right</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each Array.from({ length: BINS }, (_, i) => i).filter((i) => panels.some((p) => p.bins.some((b) => Math.round(b.lo * BINS) === i))) as i}
						<tr>
							<td>{pct(i / BINS, 0)} to {pct((i + 1) / BINS, 0)}</td>
							{#each panels as p}
								{@const b = p.bins.find((b) => Math.round(b.lo * BINS) === i)}
								<td>{b ? b.n : ''}</td>
								<td>{b ? pct(b.acc) : ''}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>
</figure>

<style>
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
		gap: 1.5rem 2rem;
		margin-top: 1.5rem;
	}
	.panel {
		min-width: 0;
	}
	h4 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-size: var(--step-0);
		font-weight: 600;
	}
	.ece {
		margin-top: 0.2rem;
		font-size: var(--step--1);
		color: var(--ink-2);
	}
	.ece strong {
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.measure {
		height: 0;
	}
	.plot {
		margin-top: 0.75rem;
	}
	.diag {
		stroke: var(--muted);
		stroke-width: 1;
		stroke-dasharray: 4 4;
	}
	.ci {
		stroke-width: 2;
		stroke-linecap: round;
		opacity: 0.55;
	}
	.dot {
		stroke: var(--surface);
		stroke-width: 2;
	}
	.dot.on {
		stroke: var(--ink);
	}
	.hit {
		fill: transparent;
	}
</style>
