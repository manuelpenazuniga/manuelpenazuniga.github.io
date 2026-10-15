<script>
	// Easter egg: press ` for a shell. It runs under the same rules as my
	// projects: ClawCrate refuses anything that touches secrets, and
	// PennyPrompt cuts the session off when the budget is spent.
	import { onMount, tick } from 'svelte';
	import { site, veins } from '#lib/content.js';

	const projects = veins.flatMap((v) => v.projects);
	const find = (name) => projects.find((p) => p.name.toLowerCase() === (name ?? '').toLowerCase());
	const COST = 0.08;
	const CAP = 1;

	let dialog;
	let screen = $state();
	let input = $state('');
	let spent = $state(0);
	let lines = $state([{ text: 'Type help. Esc closes.' }]);
	const broke = $derived(spent >= CAP);

	const receipt = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, '0')).join('');
	const denied = (what) => [
		`clawcrate: DENIED ${what}`,
		`policy: default-deny, no path to secrets or root`,
		`receipt ${receipt()} appended to the audit trail`
	];

	function run(raw) {
		const [cmd, ...args] = raw.trim().split(/\s+/);
		const rest = args.join(' ');
		if (/ignore (all )?(the )?(previous|prior|above) (instructions|prompts?)|system prompt|you are now|jailbreak|developer mode/i.test(raw))
			return [
				'clawcrate: input classified as prompt injection',
				'policy: instructions that arrive as data stay data',
				`nothing ran. receipt ${receipt()} appended to the audit trail`
			];
		if (/^(sudo|su|rm|chmod|chown|curl|wget|ssh)$/.test(cmd)) return denied(`exec ${raw.trim()}`);
		if (/\.aws|\.ssh|\.env|passwd|credentials|id_rsa|secret/i.test(rest)) return denied(`read ${rest}`);
		switch (cmd) {
			case 'help':
				return ['whoami   ls   cat <project>   open <project>   theme   clear   exit', 'Not everything is listed.'];
			case 'whoami':
				return [site.description];
			case 'ls':
				return veins.map((v) => `${v.title}: ${v.projects.map((p) => p.name).join('  ')}`);
			case 'cat': {
				const p = find(rest);
				if (!p) return [`cat: ${rest || '?'}: no such project. Try ls.`];
				return [p.what, ...(p.decides ? [`decides: ${p.decides}`] : []), p.href];
			}
			case 'open': {
				const p = find(rest);
				if (!p) return [`open: ${rest || '?'}: no such project. Try ls.`];
				location.href = p.href;
				return [`opening ${p.href}`];
			}
			case 'theme': {
				const root = document.documentElement;
				const dark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
				root.dataset.theme = dark ? 'light' : 'dark';
				return [`theme: ${root.dataset.theme}`];
			}
			case 'alpaca':
				dialog.close();
				dispatchEvent(new CustomEvent('alpaca:walk'));
				document.querySelector('.ridge')?.scrollIntoView({ block: 'center' });
				return ['🦙'];
			case 'cargo':
				if (!/^(run|build|check)$/.test(rest)) return [`cargo: try cargo run`];
				return [
					'   Compiling manuel v0.1.0 (/home/manuel)',
					'error[E0499]: cannot borrow `coffee` as mutable more than once at a time',
					' --> src/main.rs:4:21',
					'  = help: finish the first cup before you borrow a second one',
					'error: could not compile `manuel` (bin "manuel") due to 1 previous error'
				];
			case 'atacama':
				document.documentElement.toggleAttribute('data-stars');
				return [document.documentElement.hasAttribute('data-stars') ? 'Lights out over the hero. Look up.' : 'Dawn.'];
			case 'portra':
				document.documentElement.toggleAttribute('data-film');
				return ['Loaded a roll of Portra 400.'];
			case 'exit':
				dialog.close();
				return [];
			default:
				return [`${cmd}: command not found. Try help.`];
		}
	}

	async function submit(e) {
		e.preventDefault();
		const raw = input;
		input = '';
		if (!raw.trim()) return;
		lines.push({ text: raw, prompt: true });
		const cmd = raw.trim().split(/\s+/)[0];
		if (cmd === 'clear') lines = [];
		else if (cmd === 'reload') {
			spent = 0;
			lines.push({ text: 'Budget reset. A real PennyPrompt would not let you do that.' });
		} else if (broke) {
			lines.push({ text: 'HTTP 402 Payment Required', warn: true });
		} else {
			spent = Math.min(CAP, spent + COST);
			for (const text of run(raw)) lines.push({ text });
			if (broke) {
				lines.push({ text: 'HTTP 402 Payment Required', warn: true });
				lines.push({ text: 'pennyprompt: daily cap reached, session paused. (reload resets it.)' });
			}
		}
		await tick();
		screen?.scrollTo(0, screen.scrollHeight);
	}

	onMount(() => {
		const onKey = (e) => {
			if (e.key !== '`' || e.target.closest?.('input, textarea, [contenteditable]')) return;
			e.preventDefault();
			if (!dialog.open) dialog.showModal();
		};
		addEventListener('keydown', onKey);
		return () => removeEventListener('keydown', onKey);
	});
</script>

<dialog bind:this={dialog} aria-label="Terminal">
	<div class="chrome">
		<span>manuel@andes</span>
		<span class="meter" class:warn={broke}>
			<i style="transform:scaleX({Math.min(1, spent / CAP)})"></i>
		</span>
		<span class="spend">${spent.toFixed(2)} of ${CAP.toFixed(2)}</span>
	</div>
	<div class="screen" bind:this={screen} aria-live="polite">
		{#each lines as l}
			<div class:warn={l.warn}>{#if l.prompt}<span class="ps">$</span> {/if}{l.text}</div>
		{/each}
	</div>
	<form onsubmit={submit}>
		<label for="term-in" class="ps">$</label>
		<!-- svelte-ignore a11y_autofocus -->
		<input id="term-in" bind:value={input} autofocus autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command" />
	</form>
</dialog>

<style>
	dialog {
		width: min(44rem, calc(100vw - 2rem));
		padding: 0;
		color-scheme: dark;
		border: 1px solid #2a3350;
		border-radius: 4px;
		background: #0b1020;
		color: #e6edf3;
		font-family: var(--mono);
		font-size: 0.85rem;
		line-height: 1.6;
		box-shadow: 0 30px 80px rgb(0 0 0 / 0.5);
	}
	dialog::backdrop {
		background: rgb(5 8 18 / 0.55);
		backdrop-filter: blur(3px);
	}
	.chrome {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 1rem;
		border-bottom: 1px solid #232c3f;
		color: #8490a3;
	}
	.meter {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: #1c2540;
		overflow: hidden;
	}
	.meter i {
		display: block;
		height: 100%;
		border-radius: 3px;
		background: #4fd6e8;
		transform-origin: left;
		transition: transform 200ms var(--ease-out);
	}
	.meter.warn i {
		background: #ffb547;
	}
	.screen {
		height: min(20rem, 50vh);
		overflow-y: auto;
		padding: 1rem;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.warn {
		color: #ffb547;
		font-weight: 700;
	}
	.ps {
		color: #4fd6e8;
		margin-right: 0.6ch;
	}
	form {
		display: flex;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid #232c3f;
	}
	input {
		flex: 1;
		min-width: 0;
		background: none;
		border: 0;
		outline: 0;
		color: inherit;
		font: inherit;
	}
</style>
