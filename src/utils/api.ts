import axios, { AxiosError } from "axios";
import type { BlacklistedAddress, FormData } from "../types";

const BLACKLIST_API_URL = import.meta.env.VITE_BLACKLIST_API_URL;
const BLACKLIST_POST_URL = import.meta.env.VITE_BLACKLIST_POST_URL;
const APP_ID = import.meta.env.VITE_APP_ID;



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

  if (query) {
    message += `;${query}`;
  }

  const messageBytes = encoder.encode(message);
  const bodyBytes = encoder.encode(body);
  const combined = new Uint8Array(messageBytes.length + bodyBytes.length);
  combined.set(messageBytes);
  combined.set(bodyBytes, messageBytes.length);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, combined);
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toLowerCase();

  return hex;
}

export const fetchBlacklistedAddress = async (address: string = ''): Promise<BlacklistedAddress> => {
  try {
    const url = address
      ? `${BLACKLIST_API_URL}?address=${encodeURIComponent(address)}`
      : BLACKLIST_API_URL;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch blacklisted addresses: ${error.response?.data?.status || error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching blacklisted addresses');
  }
};

export const manageBlacklistedAddress = async (payload: FormData, appSecret: string): Promise<BlacklistedAddress | { message: string }> => { // [mod] Add appSecret parameter
  try {
    const timestamp = generateTimestamp();

    const nonce = generateNonce();
    const method = 'POST';
    const url = '/api/data/sync';
    const query = '';
    const body = JSON.stringify(payload);

    const signature = await computeHmacSignature(
      APP_ID,
      timestamp,
      nonce,
      method,
      url,
      query,
      body,
      appSecret
    );
    console.log(`Payload : ${JSON.stringify(payload)}`);
    console.log(`Signature : ${signature}`);
    console.log(`Secret : ${appSecret}`);
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
    const response = await axios.post<BlacklistedAddress>(BLACKLIST_POST_URL, payload, config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to create blacklisted address: ${error.response?.data?.message || error.response?.data?.status}`);
    }
    throw new Error('An unexpected error occurred while managing blacklisted address');
  }
};