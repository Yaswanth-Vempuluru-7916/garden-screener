import axios, { AxiosError } from "axios";
import type { BlacklistedAddress, DeletePayload, FormData } from "../types";

const BLACKLIST_API_URL = import.meta.env.VITE_BLACKLIST_API_URL;

// TODO: Replace with actual endpoint
const BLACKLIST_POST_URL = import.meta.env.VITE_BLACKLIST_POST_URL;


const APP_ID = import.meta.env.VITE_APP_ID;
const APP_SECRET = import.meta.env.VITE_APP_SECRET; 

// Generate timestamp for POST request headers
const generateTimestamp = (): string => {
    return Date.now().toString();
}

const generateNonce = (): string => {
    return Date.now().toString();    
};


export async function computeHmacSignature(
  appId: string,
  timestamp: string,
  nonce: string,
  method: string,
  url: string,
  query: string,
  body: string,
  appSecret: string
): Promise<string> {
    
  const encoder = new TextEncoder();

  const headerStr = [appId, timestamp, nonce, method.toUpperCase(), url, ''].join(';');
  let message = headerStr;

  // Append query if present
  if (query) {
    message += `;${query}`;
  }

  // Convert message and body to Uint8Array
  const messageBytes = encoder.encode(message);
  const bodyBytes = encoder.encode(body);

  // Combine both byte arrays
  const combined = new Uint8Array(messageBytes.length + bodyBytes.length);
  combined.set(messageBytes);
  combined.set(bodyBytes, messageBytes.length);

  // Import secret key
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Generate HMAC signature
  const signature = await crypto.subtle.sign('HMAC', key, combined);

  // Convert to lowercase hex
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toLowerCase();

  return hex;
}

// GET: Fetch all blacklisted addresses
export const fetchBlacklistedAddresses = async (): Promise<BlacklistedAddress[]> => {
  try {
    const response = await axios.get<BlacklistedAddress[]>(BLACKLIST_API_URL);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch blacklisted addresses: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching blacklisted addresses');
  }
};

// POST: Create, update, or delete a blacklisted address
export const manageBlacklistedAddress = async (payload: FormData | DeletePayload): Promise<BlacklistedAddress | { message: string }> => {
  try {
    const timestamp = generateTimestamp();
    const nonce = generateNonce();
    const method = 'POST';
    const url = BLACKLIST_POST_URL;
    const query = ''; // No query params for POST
    const body = JSON.stringify(payload);

    const signature = await computeHmacSignature(
      APP_ID,
      timestamp,
      nonce,
      method,
      url,
      query,
      body,
      APP_SECRET
    );

    const config = {
      headers: {
        'X-Signature-appid': APP_ID,
        'X-Signature-timestamp': timestamp,
        'X-Signature-nonce': nonce,
        'X-Signature-signature': signature,
        'Content-Type': 'application/json',
      },
      maxBodyLength: Infinity,
    };
    const response = await axios.post<BlacklistedAddress | { message: string }>(BLACKLIST_POST_URL, payload, config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to manage blacklisted address: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('An unexpected error occurred while managing blacklisted address');
  }
};