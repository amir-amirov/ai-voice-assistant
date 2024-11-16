const apiKey = process.env.API_KEY

const chatGPTEndpoint = 'https://api.openai.com/v1/chat/completions';
const dalleEndpoint = 'https://api.openai.com/v1/images/generations'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const apiCall = async (prompt, messages) => {
    try {
        const response = await fetch(chatGPTEndpoint, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", 
                messages: [{
                    role: 'user',
                    content: `Does this message want to generate an AI picture, image, art, or anything similar? ${prompt}. Simply answer with yes or no.`
                }]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message}`);
        }

        const data = await response.json();
        console.log('API Response:', data.choices[0].message);
        
        let isArt = data.choices[0]?.message.content
        if(isArt.toLowerCase().includes('yes')){
            console.log('dalle api call')
            return dalleApiCall(prompt, messages || [])
        } else {
            console.log('chatgpt api call')
            return chatgptApiCall(prompt, messages || [])
        }

    } catch (err) {
        console.error('Error from OpenAI API:', err.message);
        if (err.message && err.message.includes("429")) {
            console.log('Rate limit exceeded. Please try again later.');
        }
        return null;
    }
};

export const chatgptApiCall = async(prompt, messages) => {
    try{
        const response = await fetch(chatGPTEndpoint, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", 
                messages
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message}`);
        }

        const data = await response.json();
        let answer = data.choices[0]?.message.content
        messages.push({role: 'assistant', content: answer.trim()})
        
        return messages

    } catch(err) {
        console.error('Error from OpenAI API:', err.message);
        if (err.message && err.message.includes("429")) {
            console.log('Rate limit exceeded. Please try again later.');
        }
        return null;
    }
}

export const dalleApiCall = async(prompt, messages) => {
    try{
        const response = await fetch(dalleEndpoint, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "dall-e-3",
                prompt,
                n: 1,
                size: "1024x1024"
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message}`);
        }

        const data = await response.json();
        let url = data.data[0]?.url
        console.log("got the url image: ", url)
        messages.push({role: 'assistant', content: url})
        
        return messages
    } catch(err) {
        console.error('Error from OpenAI API:', err.message);
        if (err.message && err.message.includes("429")) {
            console.log('Rate limit exceeded. Please try again later.');
        }
        return null;
    }
}
