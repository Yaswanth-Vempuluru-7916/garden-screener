export interface BlacklistedAddress {
  address: string; // Blockchain address (e.g., "bc1qng0keqn7cq6p8qdt4rjnzdxrygnzq7nd0pju8q")
  blacklisted_at: string; // ISO timestamp (e.g., "2025-06-06T10:00:22.720937")
  chain: string; // Blockchain network (e.g., "bitcoin")
  flagged_by: string; // Entity that flagged the address (e.g., "TRM")
  remarks: string | null; // Optional remarks (can be null)
  id : string
}

export interface FormDataPayload{
  address : string;
  network : string;
  remark : string;
  tag : string;
}

export interface FormData{
  data : FormDataPayload;
  id : string;
  type : 'create' | 'edit' | 'delete'
}