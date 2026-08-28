// One-time setup for the wallet collection. Run with APPWRITE_API_KEY set.
// The API key is server-side only and must never use the NEXT_PUBLIC_ prefix.
const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "").replace(/\/$/, "");
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const key = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "smart-rto";
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID || "wallet-documents";

if (!endpoint || !project || !key) throw new Error("Set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY.");

async function request(path, options = {}) {
  const response = await fetch(`${endpoint}${path}`, { ...options, headers: { "content-type": "application/json", "X-Appwrite-Project": project, "X-Appwrite-Key": key, ...(options.headers || {}) } });
  if (!response.ok && response.status !== 409) throw new Error(`${response.status} ${await response.text()}`);
  return response;
}

await request(`/databases/${databaseId}`, { method: "PUT", body: JSON.stringify({ databaseId, name: "Smart RTO Wallet" }) });
await request(`/databases/${databaseId}/collections/${collectionId}`, { method: "PUT", body: JSON.stringify({ collectionId, name: "Wallet documents", documentSecurity: true, permissions: ["create(\"users\")"] }) });
for (const attribute of [
  ["userId", "string", 64, false],
  ["type", "string", 20, false],
  ["number", "string", 32, false],
  ["holderName", "string", 120, false],
  ["status", "string", 20, false],
]) {
  const [keyName, type, size, required] = attribute;
  await request(`/databases/${databaseId}/collections/${collectionId}/attributes/${type}`, { method: "POST", body: JSON.stringify({ key: keyName, size, required }) });
}
await request(`/databases/${databaseId}/collections/${collectionId}/indexes/user-id`, { method: "POST", body: JSON.stringify({ key: "user-id", type: "key", attributes: ["userId"] }) });
console.log(`Wallet collection ready: ${databaseId}/${collectionId}`);
