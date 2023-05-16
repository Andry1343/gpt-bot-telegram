import { Configuration, OpenAIApi } from "openai";
import { createReadStream } from "fs";
import dotenv from "dotenv";
dotenv.config();

class OpenAI {
  roles = {
    ASISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  };

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      });
      return response.data.choices[0].message;
    } catch (error) {
      console.log("Error while writing gpt chat", error.message);
      throw error;
    }
  }

  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1'
      );
      return response.data.text;
    } catch (error) {
      console.log("Error while transcription", error.message);
      throw error;
    }
  }
}

export const openai = new OpenAI(process.env.OPENAI_API_KEY);



/* import { Configuration, OpenAIApi } from "openai";
import { createReadStream } from "fs";
import dotenv from "dotenv"
dotenv.config();

class OpenAI {
  roles = {
    ASISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  }

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

   async chat(messages) {
    try {
     const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      })
      return response.data.choices[0].message
    } catch (e) {
      console.log("Error while write gpt chat", e.message);
    }
  }

  async transcription(filepath) {
    try {
     const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1'
     );
     return response.data.text
    } catch (e) {
      console.log("Error while transription", e.message);
    }
  }
}

export const openai = new OpenAI(process.env.OPENAI_API_KEY);
 */