// src/lib/openai.ts
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// const apiKey = process.env.OPENAI_API_KEY;
// if (!apiKey) {
//   throw new Error('OPENAI_API_KEY is not defined in environment variables');
// }

// console.log(process.env.OPENAI_API_KEY || "No API key found");

export const openai = new OpenAI({
  apiKey: "sk-proj-1234567890",
  // baseURL: "https://oai.helicone.ai/v1",
  // defaultHeaders: {
  //   "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`
  // }
});