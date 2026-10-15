<script>
	import posts from '#lib/data/posts.json';
	import { monthName } from '#lib/series.js';

	const when = (iso) => {
		const [y, m] = iso.split('-').map(Number);
		return `${monthName(m)} ${y}`;
	};
</script>

<section id="writing" class="wrap band">
	<h2>Writing</h2>
	<div class="band-body">
		{#if posts.length}
			<ol>
				{#each posts as post}
					<li>
						<time datetime={post.date}>{when(post.date)}</time>
						<a href={post.url}>{post.title}</a>
						<span class="src">{post.source}</span>
					</li>
				{/each}
			</ol>
		{:else}
			<p class="lead">Nothing published yet.</p>
		{/if}
		<p class="more">
			New posts show up here on their own, from
			<a href="https://medium.com/@manuelpz.dev">Medium</a> and
			<a href="https://manuelpzdev.substack.com">Substack</a>.
		</p>
	</div>
</section>

<style>
	.more {
		margin-top: 1.5rem;
		font-size: var(--step--1);
		color: var(--muted);
	}
	li {
		display: grid;
		grid-template-columns: 6.5rem minmax(0, 1fr) auto;
		gap: 0.25rem 1.5rem;
		align-items: baseline;
		padding-block: 1rem;
		border-top: 1px solid var(--line);
	}
	li:first-child {
		border-top: 0;
		padding-top: 0;
	}
	time,
	.src {
		font-size: var(--step--1);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	a {
		font-size: var(--step-1);
		font-weight: 600;
		line-height: 1.2;
		text-decoration: none;
		text-wrap: balance;
	}
	a:hover {
		text-decoration: underline;
		text-decoration-color: var(--cyan);
	}
	@media (max-width: 40rem) {
		li {
			grid-template-columns: 1fr auto;
		}
		a {
			grid-column: 1 / -1;
			grid-row: 2;
		}
	}
</style>
