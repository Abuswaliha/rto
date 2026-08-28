import {
  Account,
  Client,
  Databases,
  Functions,
  OAuthProvider,
  Storage,
  Permission,
  Query,
  Role,
} from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
export const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
export const appwriteDocumentsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID || "wallet-documents";
export const appwriteApplicationCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_APPLICATION_COLLECTION_ID || "application";
export const appwriteServicesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_SERVICES_COLLECTION_ID || "services";
export const appwriteVehicleCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_VEHICLE_COLLECTION_ID || "vehicle";

export const client = new Client();
export const isAppwriteConfigured = Boolean(endpoint && projectId);

if (isAppwriteConfigured) {
  client.setEndpoint(endpoint!).setProject(projectId!);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export type ApplicationDocument = {
  $id?: string;
  userId: string;
  app_type: string;
  app_detail: string; // JSON payload
  $createdAt?: string;
  $updatedAt?: string;
};

export type VehicleRecord = {
  $id?: string;
  userId?: string;
  regNumber: string;
  ownerName: string;
  makerModel: string;
  vehicleClass: string;
  fuelType: string;
  regDate?: string;
  fitnessValidUntil?: string;
  insuranceValidUntil?: string;
  pucValidUntil?: string;
  rtoOffice: string;
  status?: string;
};

export type ServiceRecord = {
  $id?: string;
  service_id: string;
  title: string;
  category: string;
  description: string;
  route: string;
  fee?: number;
  is_active?: boolean;
};

export type WalletDocument = {
  type: "Aadhaar" | "PAN" | "Driving Licence" | "RC";
  number: string;
  holderName: string;
  status: "active" | "expired" | "pending";
};

// ==========================================
// Application Table Functions
// ==========================================

/** Save or submit an application record to Appwrite */
export async function saveApplicationRecord(params: {
  userId: string;
  app_type: string;
  app_detail: Record<string, unknown> | string;
  documentId?: string;
}) {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set.");
  }

  const detailString =
    typeof params.app_detail === "string"
      ? params.app_detail
      : JSON.stringify(params.app_detail);

  const docId = params.documentId || "unique()";

  return databases.createDocument({
    databaseId: appwriteDatabaseId,
    collectionId: appwriteApplicationCollectionId,
    documentId: docId,
    data: {
      userId: params.userId,
      app_type: params.app_type,
      app_detail: detailString,
    },
    permissions: [
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ],
  });
}

/** List applications for a specific user */
export async function listUserApplications(userId: string) {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId) return [];

  try {
    const result = await databases.listDocuments({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteApplicationCollectionId,
      queries: [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
    });
    return result.documents as unknown as ApplicationDocument[];
  } catch (error) {
    console.error("Failed to list applications from Appwrite:", error);
    return [];
  }
}

/** Get a single application document by ID */
export async function getApplicationById(documentId: string) {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId) return null;

  try {
    const result = await databases.getDocument({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteApplicationCollectionId,
      documentId,
    });
    return result as unknown as ApplicationDocument;
  } catch (error) {
    console.error("Failed to fetch application:", error);
    return null;
  }
}

// ==========================================
// Vehicle Table Functions
// ==========================================

/** Fetch vehicle registration details by vehicle registration number */
export async function getVehicleByRegNumber(regNumber: string) {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId) return null;

  try {
    const result = await databases.listDocuments({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteVehicleCollectionId,
      queries: [Query.equal("regNumber", regNumber.trim().toUpperCase())],
    });
    if (result.documents.length > 0) {
      return result.documents[0] as unknown as VehicleRecord;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch vehicle:", error);
    return null;
  }
}

/** Save or register a vehicle in Appwrite */
export async function saveVehicleRecord(vehicle: VehicleRecord) {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set.");
  }

  return databases.createDocument({
    databaseId: appwriteDatabaseId,
    collectionId: appwriteVehicleCollectionId,
    documentId: "unique()",
    data: vehicle,
    permissions: [
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ],
  });
}

// ==========================================
// Services Table Functions
// ==========================================

/** List all available RTO services from Appwrite */
export async function listServicesCatalog() {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId) return [];

  try {
    const result = await databases.listDocuments({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteServicesCollectionId,
      queries: [Query.equal("is_active", true)],
    });
    return result.documents as unknown as ServiceRecord[];
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

// ==========================================
// Wallet Documents Functions
// ==========================================

/** Store synthetic/demo document metadata, scoped to the signed-in user. */
export async function saveWalletDocument(document: WalletDocument) {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId || !appwriteDocumentsCollectionId) {
    throw new Error("Set NEXT_PUBLIC_APPWRITE_DATABASE_ID and NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID.");
  }
  const user = await account.get();
  return databases.createDocument({
    databaseId: appwriteDatabaseId,
    collectionId: appwriteDocumentsCollectionId,
    documentId: "unique()",
    data: { ...document, userId: user.$id },
    permissions: [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ],
  });
}

export async function listWalletDocuments() {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId || !appwriteDocumentsCollectionId) return [];
  const user = await account.get();
  const result = await databases.listDocuments({
    databaseId: appwriteDatabaseId,
    collectionId: appwriteDocumentsCollectionId,
    queries: [Query.equal("userId", user.$id)],
  });
  return result.documents as unknown as Array<WalletDocument & { $id: string }>;
}

export function requireAppwriteConfiguration() {
  if (!isAppwriteConfigured) {
    throw new Error(
      "Appwrite is not configured. Set NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env.local.",
    );
  }
}

export function signInWithGoogle(success: string, failure: string) {
  requireAppwriteConfiguration();

  return account.createOAuth2Session({
    provider: OAuthProvider.Google,
    success,
    failure,
  });
}
