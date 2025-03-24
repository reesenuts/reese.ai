<script lang="ts">
    import { goto } from "$app/navigation";
</script>

<div class="flex flex-col justify-between h-screen">
    <header class="mt-10">
        <p class="font-bold text-2xl" style="color: var(--sinister);">@reesenuts</p>
    </header>
    
    <main class="space-y-10 mb-22">
        <h1 class="text-8xl font-bold text-wrap w-2/2" style="color: var(--sinister);">Explore knowledge with Reese.ai Chat Bot.</h1>
        <div class="w-1/2 p-2 rounded-full flex justify-between items-center" style="background-color: var(--lynx);">
            <p class="text-sm pl-5" style="color: var(--bedrock);">How can I help?</p>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button on:click={() => goto('/chatbot')} class="p-4 rounded-full cursor-pointer" style="background-color: var(--placebo);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2383E2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                </svg>
            </button>
        </div>
    </main>

    <footer class="mb-10">
        <p class="text-xs" style="color: var(--bedrock);">Powered by <span class="font-semibold">Svelte</span></p>
    </footer>
</div>