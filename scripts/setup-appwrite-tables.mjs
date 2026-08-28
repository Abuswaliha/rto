/**
 * Appwrite Tables Setup Script
 * 
 * To run this script:
 * 1. Go to Appwrite Console -> Project Settings -> API Keys
 * 2. Create an API Key with 'databases.write' and 'collections.write' permissions
 * 3. Run: APPWRITE_API_KEY="your_api_key" node scripts/setup-appwrite-tables.mjs
 */

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a8eb68400316d5ce0ea";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "smart-rto";
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.log(`
========================================================================
Appwrite Setup Helper:
To create the tables automatically from terminal:
1. Go to Appwrite Console -> Project Settings -> API Keys
2. Create an API Key with 'databases.write' and 'collections.write' scope
3. Run:
   $env:APPWRITE_API_KEY="your_key_here"; node scripts/setup-appwrite-tables.mjs
========================================================================
  `);
}

async function createTable(collectionId, name, permissions) {
  const url = `${ENDPOINT}/databases/${DATABASE_ID}/collections`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": PROJECT_ID,
      "X-Appwrite-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      collectionId,
      name,
      permissions: permissions || ['read("any")', 'create("users")', 'update("users")'],
      documentSecurity: false,
    }),
  });
  return res.json();
}

async function addStringAttribute(collectionId, key, size, required = true, defaultValue = null) {
  const url = `${ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/attributes/string`;
  const body = { key, size, required };
  if (defaultValue !== null) body.default = defaultValue;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": PROJECT_ID,
      "X-Appwrite-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function addBooleanAttribute(collectionId, key, required = false, defaultValue = true) {
  const url = `${ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/attributes/boolean`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": PROJECT_ID,
      "X-Appwrite-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key, required, default: defaultValue }),
  });
  return res.json();
}

async function addIntegerAttribute(collectionId, key, required = false, defaultValue = 0) {
  const url = `${ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/attributes/integer`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": PROJECT_ID,
      "X-Appwrite-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key, required, default: defaultValue }),
  });
  return res.json();
}

async function main() {
  if (!API_KEY) return;
  console.log("Creating 'services' table in Appwrite...");
  try {
    await createTable("services", "services", ['read("any")']);
    console.log("Services table created! Adding attributes...");
    
    await addStringAttribute("services", "service_id", 100, true);
    await addStringAttribute("services", "title", 255, true);
    await addStringAttribute("services", "category", 100, true);
    await addStringAttribute("services", "description", 500, true);
    await addStringAttribute("services", "route", 255, true);
    await addBooleanAttribute("services", "is_active", false, true);
    await addIntegerAttribute("services", "fee", false, 0);

    console.log("All attributes added successfully to 'services' table!");
  } catch (err) {
    console.error("Error setting up Appwrite tables:", err);
  }
}

main();
