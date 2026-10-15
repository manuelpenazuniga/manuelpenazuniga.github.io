<script>
	// Commits per month, stacked by language, drawn as a geological section.
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import activity from '#lib/data/activity.json';
	import { series, monthName, num } from '#lib/series.js';

	const slotOf = {};
	series.forEach((s, i) => s.langs.forEach((l) => (slotOf[l] = i)));

	const per = new Map();
	for (const [k, v] of Object.entries(activity.strata)) {
		const [ym, lang] = k.split(',');
		const row = per.get(ym) ?? Array(series.length).fill(0);
		row[slotOf[lang] ?? 0] += v;
		per.set(ym, row);
	}
	const index = (ym) => {
		const [y, m] = ym.split('-').map(Number);
		return y * 12 + m - 1;
	};
	const keys = [...per.keys()].sort();
	const months = [];
	for (let i = index(keys[0]); i <= index(keys.at(-1)); i++) {
		const y = Math.floor(i / 12);
		const m = (i % 12) + 1;
		const vals = per.get(`${y}-${String(m).padStart(2, '0')}`) ?? Array(series.length).fill(0);
		months.push({ y, m, vals, total: vals.reduce((a, b) => a + b, 0) });
	}

	// The longest silent stretch is collapsed into one marked break, the way a
	// geologist draws an unconformity, so the busy months keep their width.
	let gap = { start: -1, len: 0 };
	let run = 0;
	months.forEach((mo, i) => {
		run = mo.total === 0 ? run + 1 : 0;
		if (run > gap.len) gap = { start: i - run + 1, len: run };
	});
	const GAP_UNITS = 3;
	const slots = [];
	months.forEach((mo, i) => {
		const inGap = gap.len >= 6 && i >= gap.start && i < gap.start + gap.len;
		if (!inGap) slots.push({ ...mo, units: 1 });
		else if (i === gap.start) slots.push({ gap: true, units: GAP_UNITS });
	});
	const units = slots.reduce((a, s) => a + s.units, 0);
	const active = months.filter((mo) => mo.total > 0);
	const peak = active.reduce((a, b) => (b.total > a.total ? b : a));
	const yMax = Math.ceil(peak.total / 200) * 200;
	const yTicks = Array.from({ length: yMax / 200 + 1 }, (_, i) => i * 200);

	let w = $state(720);
	let hover = $state(null);

	// the layers settle once, the first time the chart is mostly on screen;
	// tied to scroll they would sit at wrong heights whenever the reader stopped
	let plot;
	let armed = $state(false);
	let seen = $state(false);
	onMount(() => {
		if (!matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
		if (plot.getBoundingClientRect().top < innerHeight * 0.6) return;
		armed = true;
		const io = new IntersectionObserver(
			([e]) => {
				if (!e.isIntersecting) return;
				seen = true;
				io.disconnect();
			},
			{ threshold: 0.45 }
		);
		io.observe(plot);
		return () => io.disconnect();
	});

	const m = { t: 30, r: 4, b: 26, l: 36 };
	const h = $derived(w < 520 ? 250 : 320);
	const band = $derived((w - m.l - m.r) / units);
	const bw = $derived(Math.max(3, Math.min(24, band - 3)));
	const y = $derived(scaleLinear([0, yMax], [h - m.b, m.t]));
	const cols = $derived.by(() => {
		let u = 0;
		let year = 0;
		return slots.map((s) => {
			const x0 = m.l + u * band;
			u += s.units;
			const cx = x0 + (s.units * band) / 2;
			if (s.gap) return { ...s, x0, cx };
			let acc = 0;
			const segs = [];
			s.vals.forEach((v, i) => {
				if (!v) return;
				const y1 = y(acc);
				acc += v;
				segs.push({ i, v, y: y(acc), h: y1 - y(acc) });
			});
			const newYear = s.y !== year;
			year = s.y;
			return { ...s, x0, cx, segs, newYear };
		});
	});
	const gapCol = $derived(cols.find((c) => c.gap));
	const peakCol = $derived(cols.find((c) => c.y === peak.y && c.m === peak.m));

	// square at the bottom, 4px rounded where the column ends
	function cap(x, yy, ww, hh) {
		const r = Math.min(4, ww / 2, hh);
		return `M${x},${yy + hh}V${yy + r}Q${x},${yy} ${x + r},${yy}H${x + ww - r}Q${x + ww},${yy} ${x + ww},${yy + r}V${yy + hh}Z`;
	}
</script>

<figure class="figure">
	<h3>What I write, by month</h3>
	<p class="sub">
		{num(activity.commits)} commits across {activity.repos} repositories, public and private. Rust
		first shows up in April 2026.
	</p>

	<ul class="legend" aria-label="Languages">
		{#each [...series].reverse() as s}
			<li><span class="swatch" style="background:var(--s-{s.key})"></span>{s.label}</li>
		{/each}
	</ul>

	<div class="plot" class:armed class:seen bind:this={plot} bind:clientWidth={w}>
		<svg width={w} height={h} role="img" aria-label="Stacked columns of commits per month by language" onpointerleave={() => (hover = null)}>
			{#each yTicks as t}
				<line class="grid" x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} />
				<text x={m.l - 8} y={y(t) + 4} text-anchor="end">{t}</text>
			{/each}

			{#each cols as c}
				{#if !c.gap}
					<g class="col" class:dim={hover && hover !== c}>
						{#each c.segs as s, k}
							{@const last = k === c.segs.length - 1}
							{@const trim = !last && s.h > 4 ? 2 : 0}
							{#if last}
								<path d={cap(c.cx - bw / 2, s.y, bw, s.h)} fill="var(--s-{series[s.i].key})" />
							{:else}
								<rect x={c.cx - bw / 2} y={s.y + trim} width={bw} height={s.h - trim} fill="var(--s-{series[s.i].key})" />
							{/if}
						{/each}
					</g>
					{#if c.newYear}
						<text x={c.x0 + 1} y={h - 6}>{c.y}</text>
					{/if}
					{#if c.total}
						<rect class="hit" x={c.x0} y={m.t} width={band} height={h - m.t - m.b} onpointerenter={() => (hover = c)} />
					{/if}
				{/if}
			{/each}

			{#if gapCol}
				<path class="break" d="M{gapCol.cx - 9},{h - m.b + 5}l5,-10M{gapCol.cx + 4},{h - m.b + 5}l5,-10" />
				<text class="note" x={gapCol.cx} y={y(yMax * 0.3)} text-anchor="middle">
					<tspan x={gapCol.cx}>{gap.len} months</tspan>
					<tspan x={gapCol.cx} dy="15">no record</tspan>
				</text>
			{/if}
			{#if peakCol && !hover}
				<text class="note" x={peakCol.cx + bw / 2} y={y(peak.total) - 8} text-anchor="end">
					{num(peak.total)} in {monthName(peak.m)} {peak.y}
				</text>
			{/if}
		</svg>

		{#if hover}
			<div class="tip" style="left:{Math.max(96, Math.min(w - 96, hover.cx))}px; top:{y(hover.total)}px">
				<div class="tip-head">{monthName(hover.m)} {hover.y}</div>
				<ul>
					{#each [...hover.segs].reverse() as s}
						<li>
							<span class="key" style="background:var(--s-{series[s.i].key})"></span>
							{series[s.i].label}<strong class="v">{num(s.v)}</strong>
						</li>
					{/each}
					<li>Total<strong class="v">{num(hover.total)}</strong></li>
				</ul>
			</div>
		{/if}
	</div>

	<details class="table">
		<summary>Show the numbers</summary>
		<div class="scroll">
			<table>
				<thead>
					<tr>
						<th scope="col">Month</th>
						{#each series as s}<th scope="col">{s.label}</th>{/each}
						<th scope="col">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each active as mo}
						<tr>
							<td>{monthName(mo.m)} {mo.y}</td>
							{#each mo.vals as v}<td>{v || ''}</td>{/each}
							<td>{mo.total}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>
</figure>

<style>
	.col {
		transform-box: fill-box;
		transform-origin: 50% 100%;
		transition:
			opacity 0.15s ease,
			transform 600ms var(--ease-out);
	}
	.armed:not(.seen) .col {
		transform: scaleY(0);
	}
	.col.dim {
		opacity: 0.4;
	}
	.hit {
		fill: transparent;
	}
	.break {
		fill: none;
		stroke: var(--muted);
		stroke-width: 1.5;
		stroke-linecap: round;
	}
</style>
