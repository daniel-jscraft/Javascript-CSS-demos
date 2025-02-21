import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

async function analyzeImage(imagePath) {
    try {
        // Verify OpenAI API key is set
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY environment variable is not set");
        }

        // Initialize the ChatOpenAI model with GPT-4 Vision
        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            maxTokens: 1000,
        });

        // Read and encode the image
        const imageData = await fs.readFile(imagePath, { encoding: 'base64' });
        const imageDataUrl = `data:image/jpeg;base64,${imageData}`;

        // Create the message with the image
        const message = {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "Please describe what you see in this image in detail."
                },
                {
                    type: "image_url",
                    image_url: {
                        "url": imageDataUrl
                    },
                }
            ]
        };

        // Get the response from the model
        const response = await model.invoke([message]);

        return response.content;
    } catch (error) {
        console.error("Error analyzing image:", error.message);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        const result = await analyzeImage('food.jpg');
        console.log("Image Analysis Result:", result);
    } catch (error) {
        console.error("Failed to analyze image:", error);
    }
}

main();