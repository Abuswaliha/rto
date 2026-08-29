// One-time setup for Smart RTO application persistence.
// Run with APPWRITE_API_KEY set; never expose that key in NEXT_PUBLIC_* variables.
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "").replace(/\/$/, "");
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const key = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "smart-rto";
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_APPLICATION_COLLECTION_ID || "application";

if (!endpoint || !project || !key) {
  throw new Error("Set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY before running this script.");
}

async function request(path, options = {}) {
  const response = await fetch(`${endpoint}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      "X-Appwrite-Project": project,
      "X-Appwrite-Key": key,
      ...(options.headers || {}),
    },
  });
  if (!response.ok && response.status !== 409) {
    throw new Error(`${response.status} ${await response.text()}`);
  }
}

await request(`/databases/${databaseId}`, {
  method: "PUT",
  body: JSON.stringify({ databaseId, name: "Smart RTO" }),
});

await request(`/databases/${databaseId}/collections/${collectionId}`, {
  method: "PUT",
  body: JSON.stringify({
    collectionId,
    name: "Applications",
    documentSecurity: true,
    // This prototype only stores fictional records. Production must require an authenticated user.
    permissions: ['create("any")'],
  }),
});

for (const [keyName, size] of [["userId", 64], ["app_type", 100], ["app_detail", 65535]]) {
  await request(`/databases/${databaseId}/collections/${collectionId}/attributes/string`, {
    method: "POST",
    body: JSON.stringify({ key: keyName, size, required: true }),
  });
}

await request(`/databases/${databaseId}/collections/${collectionId}/indexes/user-id`, {
  method: "POST",
  body: JSON.stringify({ key: "user-id", type: "key", attributes: ["userId"] }),
});

console.log(`Application persistence ready: ${databaseId}/${collectionId}`);
