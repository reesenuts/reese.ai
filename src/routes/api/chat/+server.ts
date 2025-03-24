import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const { message, context, model } = await request.json();
    
    const systemPrompt = `You are a helpful assistant that provides clear, concise answers. 
                            You answer directly without including your thinking process.
                            Be professional, friendly, and straight to the point.

${context ? context : ''}`;

    const ollamaRequest = {
        model: model || 'tinyllama',
        prompt: message,
        system: systemPrompt,
        stream: true
    };

    // Create a readable stream to send the response
    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Connect to Ollama API
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(ollamaRequest)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Ollama API error: ${response.status} ${errorText}`);
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error('No reader available from Ollama API');

                let accumulatedResponse = '';
                let lastSentLength = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = new TextDecoder().decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.response) {
                                // Add to accumulated response
                                accumulatedResponse += data.response;
                                
                                // Clean the entire accumulated response
                                let cleanedResponse = accumulatedResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
                                
                                // Also handle cases where the closing tag hasn't arrived yet
                                cleanedResponse = cleanedResponse.replace(/<think>[\s\S]*$/, '');
                                
                                // Trim any leading/trailing whitespace that might be left after removal
                                cleanedResponse = cleanedResponse.trim();
                                
                                // Only send the new part that hasn't been sent yet
                                if (cleanedResponse.length > lastSentLength) {
                                    const newContent = cleanedResponse.substring(lastSentLength);
                                    controller.enqueue(new TextEncoder().encode(newContent));
                                    lastSentLength = cleanedResponse.length;
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
                
                controller.close();
            } catch (error) {
                console.error('Error in stream:', error);
                controller.error(error);
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
};
