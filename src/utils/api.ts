import axios, { AxiosError } from "axios";
import type { BlacklistedAddress, FormData } from "../types";

const BLACKLIST_API_URL = import.meta.env.VITE_BLACKLIST_API_URL;

// TODO: Replace with actual endpoint
const BLACKLIST_POST_URL = '';

const generateTimestamp = (): string => {
    return Date.now().toString();
}

// TODO: Replace with actual nonce generation
const generateNonce = (): string => {
    return 'nonce_json';
};

// TODO: Replace with actual signature
const generateSignature = (): string => {
    return '';
};

export const fetchAllBlackListedAddresses = async (): Promise<BlacklistedAddress[]> => {
    try {
        console.log(`BLACKLIST_API_URL : ${BLACKLIST_API_URL}`);
        const response = await axios.get<BlacklistedAddress[]>(BLACKLIST_API_URL);
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(`Failed to fetch blacklisted addresses: ${error.response?.data?.message || error.message}`);
        }
        throw new Error('An unexpected error occurred while fetching blacklisted addresses');
    }
}

export const manageBlackListedAddress = async (formData: FormData): Promise<BlacklistedAddress | { message: string }> => {
    try {

        const config = {
            headers: {
                'X-Signature-appid': '',//TODO : .env,
                'X-Signature-timestamp': generateTimestamp(),
                'X-Signature-nonce': generateNonce(),
                'X-Signature-signature': generateSignature(),
                'Content-Type': 'application/json',
            },
            maxBodyLength: Infinity,
        }

        const response = await axios.post<BlacklistedAddress | { message: string }>(BLACKLIST_POST_URL, formData, config);
        return response.data

    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(`Failed to manage blacklisted address: ${error.response?.data?.message || error.message}`);
        }
        throw new Error('An unexpected error occurred while managing blacklisted address');
    }
}