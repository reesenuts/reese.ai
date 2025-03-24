<script lang="ts">
    import { onMount } from 'svelte';
    import type { StreamingMessage } from '$lib/types';
    import { findRelevantEntries, formatContext } from '$lib/data/dataset';
    import Chat from '$lib/component/chat.svelte';

    let messages: StreamingMessage[] = [];
    let userInput = '';
    let isLoading = false;
    let selectedModel = 'tinyllama';

    function addMessage(role: 'user' | 'assistant', content: string, isStreaming = false) {
        messages = [...messages, { role, content, isStreaming }];
    }

    async function handleSubmit() {
        if (!userInput.trim()) return;
        
        const userMessage = userInput.trim();
        addMessage('user', userMessage);
        userInput = '';
        isLoading = true;

        // Find relevant context from dataset
        const relevantEntries = findRelevantEntries(userMessage);
        const context = formatContext(relevantEntries);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMessage, 
                    context,
                    model: selectedModel
                })
            });

            if (!response.ok) throw new Error('Failed to get response');
            
            
            addMessage('assistant', '', true);
            
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');
            
            let accumulatedResponse = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = new TextDecoder().decode(value);
                accumulatedResponse += chunk;
                
                messages = messages.map((msg, i) => 
                    i === messages.length - 1 
                        ? { ...msg, content: accumulatedResponse } 
                        : msg
                );
            }
            
            messages = messages.map((msg, i) => 
                i === messages.length - 1 
                    ? { ...msg, isStreaming: false } 
                    : msg
            );
        } catch (error) {
            console.error('Error:', error);
            addMessage('assistant', 'Sorry, I encountered an error while processing your request.');
        } finally {
            isLoading = false;
        }
    }

</script>

<div class="flex flex-col items-center h-screen">
    <header class="mt-10 flex justify-between items-center w-full px-10">
        <p class="font-bold text-2xl" style="color: var(--sinister);">@reesenuts</p>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="/" class="p-4 rounded-full cursor-pointer" style="background-color: var(--lynx);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2383E2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
        </a>
    </header>
    
    <main class="flex-1 overflow-y-auto space-y-10 flex flex-col justify-start items-center">
        {#if messages.length === 0}
        <p class="text-7xl font-bold text-wrap mt-60" style="color: var(--sinister);">Hi! How can I help you today?</p>
        {:else}
            {#each messages as message}
                <Chat {message} />
            {/each}
        {/if}
    </main>

    <div class="w-1/2 p-4 flex flex-col justify-center items-center">
        <div class="w-full relative flex justify-between gap-2 items-center">
            <input class="text-sm pl-5 w-full p-5 rounded-full" style="color: var(--sinister); border: 1px solid var(--dash); outline: none;" 
                placeholder="Ask Reese anything..."
                type="text"
                bind:value={userInput}
                disabled={isLoading} >

            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button class="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-full cursor-pointer" style="background-color: var(--lynx);"
                type="submit"
                disabled={isLoading || !userInput.trim()} 
                on:click={handleSubmit} >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2383E2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                </svg>
            </button>
        </div>
    </div>

    <footer class="mb-10 flex justify-center">
        <p class="text-xs" style="color: var(--bedrock);">Powered by <span class="font-semibold">Ollama</span></p>
    </footer>
</div>