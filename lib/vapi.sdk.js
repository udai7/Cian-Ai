"use client";

import Vapi from "@vapi-ai/web";

// Check if we're in the browser environment before initializing
const isClient = typeof window !== "undefined";

// Initialize VAPI client
let vapiInstance = {};

if (isClient) {
  try {
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    console.log("VAPI Token available:", !!token);
    vapiInstance = new Vapi(token);
  } catch (error) {
    console.error("Error initializing VAPI:", error);
  }
}

// Export the VAPI instance
export const vapi = vapiInstance;