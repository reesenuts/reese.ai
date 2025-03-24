<script lang="ts">
  import type { StreamingMessage } from "$lib/types";
  export let message: StreamingMessage;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
</script>

<div class="w-165 flex {message.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4 last:mb-0" >
  <div class="flex items-start gap-3 max-w-[80%] {message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}" >
    <div class="flex-1">
      <!-- <div class="flex items-center gap-2 mb-2 {message.role === 'assistant' ? '' : 'flex-row-reverse'}" >
        <span class="text-xs" style="color: var(--bedrock);">
          {formatTime(new Date())}
        </span>
      </div> -->
      <div class="relative">
        <p class="p-4 rounded-3xl whitespace-pre-wrap text-wrap text-justify break-words text-xs leading-relaxed" style="color: {message.role === 'assistant' ? 'var(--sinister)' : 'var(--silk)'}; background-color: {message.role === 'assistant' ? 'var(--lynx)' : 'var(--bleu)'};" >
          {message.content}
        </p>
      </div>
    </div>
  </div>
</div>
