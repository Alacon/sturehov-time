<script lang="ts">
	import type { PageServerData } from './$types';
	import { fade } from 'svelte/transition';

	export let data: PageServerData;

	const getSpecialClasses = (text: string): string => {
		if (text.includes('VECKA')) {
			return 'text-xl font-bold';
		}
		if (text.includes('KG1')) {
			return 'text-lg pl-24';
		}
		if (text.includes('KG2')) {
			return 'text-lg';
		}
		if (text.includes('F12')) {
			return 'font-bold text-white';
		}
	};

	$: specialClassesRow = (row: string[]) => {
		if (row.some((x) => x.includes('F12'))) {
			return 'p-2 border-fusion-blue shadow-2xl';
		}
		if (row.some((x) => x.includes('dag'))) {
			return 'pt-3 border-transparent';
		}
		if (row.some((x) => x.includes('KG'))) {
			return 'pt-3 border-transparent';
		}
		if (onlyF12 && !row.some((x) => x.includes('F12'))) {
			return 'hidden';
		}
        return 'border-transparent'
	};

	$: onlyF12 = true;
</script>

<div class="w-screen flex flex-col items-center relative bg-nightrider-black p-5 md:p-0">
	<div class="fixed bottom-0 w-full h-20 flex justify-end items-center p-5">
		<button
			on:click={() => {
				onlyF12 = !onlyF12;
			}}
			class="rounded-full p-3 transition-colors bg-fusion-blue/50 hover:bg-fusion-blue text-nightrider-black">F12</button
		>
	</div>
    <h1 class="text-white ">Sturehov tider på konstgräs</h1>
	{#each data?.schedule as item, i}
		<div in:fade={{ delay: i * 250 }} class="py-5 bg-vortex-black px-5 md:px-20 my-5 text-left w-full md:w-auto">
			<h2 class="text-xl text-white font-bold  text-left">{item.title}</h2>
			{#each item.left as leftRows}
				<div class="w-min whitespace-nowrap flex gap-x-2  text-left text-white/80  border-2 rounded {specialClassesRow(leftRows)}">
					{#each leftRows as text}
						<span class="{getSpecialClasses(text)} text-white/60  text-left" >{text}</span>
					{/each}
				</div>
			{/each}
		</div>
	{/each}
</div>
