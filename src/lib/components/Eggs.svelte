<script>
	// Hidden things. None of them are needed to read the page.
	import { onMount } from 'svelte';

	const KONAMI = 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a';
	const FILM = 'p o r t r a';
	const DESERT = 'a t a c a m a';
	const SHELL = 's h e l l';

	const walk = () => {
		dispatchEvent(new CustomEvent('alpaca:walk'));
		document.querySelector('.ridge')?.scrollIntoView({ block: 'center' });
	};
	const toggle = (attr) => document.documentElement.toggleAttribute(attr);
	const shell = () => dispatchEvent(new CustomEvent('terminal:open'));

	onMount(() => {
		console.log(
			'%c' +
				[
					'            /\\',
					'       /\\  /  \\      /\\',
					'  /\\  /  \\/    \\  /\\/  \\    /\\',
					' /  \\/          \\/      \\  /  \\',
					'/                        \\/    \\'
				].join('\n'),
			'color:#ffb547;font-family:monospace'
		);
		console.log(
			'You opened the console, so type any of these right here: shell, alpaca, portra, atacama.\n' +
				'Or close it and type them on the page itself. The Konami code works there too.'
		);

		// typing a bare name in the console reads a global, so each egg is a getter
		const eggs = {
			shell: () => (shell(), 'Opening a terminal. Click the page so the keyboard reaches it.'),
			alpaca: () => (walk(), '🦙 Scroll up to the ridge.'),
			portra: () => (toggle('data-film'), 'Loaded a roll of Portra 400.'),
			atacama: () => (toggle('data-stars'), 'Look at the sky in the header.')
		};
		for (const [name, run] of Object.entries(eggs)) {
			if (!(name in window)) Object.defineProperty(window, name, { get: run, configurable: true });
		}

		let keys = [];
		const onKey = (e) => {
			if (e.target.closest?.('input, textarea, [contenteditable]')) return;
			keys = [...keys, e.key].slice(-10);
			const typed = keys.join(' ');
			if (typed.endsWith(KONAMI)) walk();
			if (typed.endsWith(FILM)) toggle('data-film');
			if (typed.endsWith(DESERT)) toggle('data-stars');
			if (typed.endsWith(SHELL)) shell();
		};
		addEventListener('keydown', onKey);

		// leave the tab and the agent is on its own
		let title = document.title;
		const onVisibility = () => {
			if (document.hidden) {
				title = document.title;
				document.title = 'The agent is unsupervised…';
			} else {
				document.title = title;
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			removeEventListener('keydown', onKey);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});
</script>
