<script>
	import { principles } from '#lib/content.js';
</script>

<section id="approach" class="wrap band">
	<h2>Approach</h2>
	<div class="band-body">
		<p class="lead">
			A lot of AI safety is about making the model want the right thing. I work on the other half:
			assume that sometimes fails, and build the part that holds anyway.
		</p>
		<ul>
			{#each principles as p, i}
				<li>
					<span class="label">{String(i + 1).padStart(2, '0')}</span>
					<h3>{p.title}</h3>
					<p>{p.text}</p>
					<p class="seen">In {p.seen}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 2rem 2.5rem;
		margin-top: 2.5rem;
	}
	li {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-top: 0.9rem;
		border-top: 1px solid var(--ink);
	}
	h3 {
		font-family: var(--display);
		font-size: var(--step-1);
		font-weight: 600;
	}
	p {
		color: var(--ink-2);
	}
	.seen {
		margin-top: auto;
		padding-top: 0.5rem;
		font-size: var(--step--1);
		color: var(--muted);
	}
</style>
