import {
  Account,
  Client,
  Databases,
  Functions,
  ID,
  OAuthProvider,
  Storage,
  Permission,
  Query,
  Role,
} from "appwrite";
import type { DemoApplication } from "./storage";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
export const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
export const appwriteDocumentsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID || "wallet-documents";
export const appwriteDocumentsBucketId =
  process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_BUCKET_ID;
export const appwriteApplicationCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_APPLICATION_COLLECTION_ID || "application";
export const appwriteServicesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_SERVICES_COLLECTION_ID || "services";
export const appwriteVehicleCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_VEHICLE_COLLECTION_ID || "vehicle";

export const client = new Client();
export const isAppwriteConfigured = Boolean(endpoint && projectId);
export const isAppwriteStorageConfigured = Boolean(
  isAppwriteConfigured && appwriteDocumentsBucketId,
);

if (isAppwriteConfigured) {
  client.setEndpoint(endpoint!).setProject(projectId!);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

/** Return the active Appwrite user, or null when no Appwrite session exists. */
export async function getCurrentAppwriteUser() {
  if (!isAppwriteConfigured) return null;
  try {
    return await account.get();
  } catch {
    return null;
  }
}

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
  type: "Aadhaar" | "PAN" | "Driving Licence" | "RC" | "PUC" | "Insurance" | "Photo" | "Address Proof" | "Name Proof" | "Age Proof" | "Medical Self-Declaration" | "Self-Declaration" | "Self-Declaration (Form 29/30 & Medical)";
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

  let resolvedUserId = params.userId;
  try {
    const authUser = await account.get();
    if (authUser && authUser.$id) {
      resolvedUserId = authUser.$id;
    }
  } catch {
    // If not logged in, keep provided userId or fallback
  }

  const detailString =
    typeof params.app_detail === "string"
      ? params.app_detail
      : JSON.stringify(params.app_detail);

  const docId = params.documentId || "unique()";

  const permissions = [
    Permission.read(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any()),
  ];

  try {
    return await databases.createDocument({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteApplicationCollectionId,
      documentId: docId,
      data: {
        userid: resolvedUserId,
        app_type: params.app_type,
        app_detail: detailString,
      },
      permissions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Unknown attribute") || message.includes("Invalid document structure")) {
      return await databases.createDocument({
        databaseId: appwriteDatabaseId,
        collectionId: appwriteApplicationCollectionId,
        documentId: docId,
        data: {
          userId: resolvedUserId,
          app_type: params.app_type,
          app_detail: detailString,
        },
        permissions,
      });
    }
    throw err;
  }
}

/** List applications for a specific user */
export async function listUserApplications(userId: string) {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId) return [];

  let resolvedUserId = userId;
  try {
    const authUser = await account.get();
    if (authUser && authUser.$id) {
      resolvedUserId = authUser.$id;
    }
  } catch {
    // fallback
  }

  try {
    const result = await databases.listDocuments({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteApplicationCollectionId,
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

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readDetail(value: string): RecordValue | null {
  try {
    const detail: unknown = JSON.parse(value);
    return isRecord(detail) ? detail : null;
  } catch {
    return null;
  }
}

/** Convert submitted Appwrite payloads into the UI's common application record. */
export function applicationDocumentToDemo(document: ApplicationDocument): DemoApplication | null {
  const detail = readDetail(document.app_detail);
  if (!detail || typeof detail.applicationNumber !== "string") return null;
  const applicant = isRecord(detail.applicant) ? detail.applicant : {};
  const buyer = isRecord(detail.buyer) ? detail.buyer : {};
  const appointment = isRecord(detail.appointment) ? detail.appointment : {};
  const payment = isRecord(detail.payment) ? detail.payment : {};
  const vehicle = isRecord(detail.vehicle) ? detail.vehicle : {};
  const status = isRecord(detail.status) ? detail.status : {};
  const code = typeof status.code === "string" ? status.code : "";
  let displayStatus = typeof status.current === "string" ? status.current : "";
  if (code === "DL_DISPATCHED") {
    displayStatus = "Smart Card DL Dispatched via Speed Post";
  } else if (code === "APPROVED") {
    displayStatus = "Permanent Driving Licence Approved";
  } else if (code === "TRACK_TEST_PASSED") {
    displayStatus = "Driving Track Test Passed · Card Printing in Progress";
  } else if (code === "RC_TRANSFERRED" || code === "RC_ENDORSED") {
    displayStatus = "Ownership Transferred & New RC Issued";
  } else if (!displayStatus) {
    displayStatus = code === "UNDER_REVIEW" ? "Submitted · In Scrutiny" : "Test Scheduled · Active Slot";
  }

  return {
    id: detail.applicationNumber,
    status: displayStatus,
    statusCode: code,
    appointment: typeof appointment.slot === "string" ? appointment.slot : "RC Endorsement in Scrutiny",
    rto: typeof appointment.rto === "string" ? appointment.rto : typeof vehicle.rtoOffice === "string" ? vehicle.rtoOffice : "MH-10 Sangli RTO",
    submittedAt: document.$createdAt || new Date().toISOString(),
    fullName: typeof applicant.fullName === "string" ? applicant.fullName : typeof applicant.name === "string" ? applicant.name : typeof buyer.name === "string" ? buyer.name : "Demo Citizen",
    appointmentId: typeof appointment.id === "string" ? appointment.id : undefined,
    paymentReference: typeof payment.reference === "string" ? payment.reference : undefined,
    paymentMethod: "Demo Online UPI",
    feeTotal: typeof payment.amount === "number" ? `INR ${payment.amount}.00 (Paid)` : undefined,
    identity: typeof applicant.aadhaarNumber === "string" ? applicant.aadhaarNumber : typeof applicant.aadhaar === "string" ? applicant.aadhaar : typeof buyer.aadhaar === "string" ? buyer.aadhaar : undefined,
    mobile: typeof applicant.mobile === "string" ? applicant.mobile : typeof buyer.mobile === "string" ? buyer.mobile : undefined,
    address: typeof applicant.address === "string" ? applicant.address : typeof buyer.address === "string" ? buyer.address : undefined,
    vehicle: Array.isArray(detail.vehicleClasses) ? detail.vehicleClasses.filter((item): item is string => typeof item === "string").join(" / ") : typeof vehicle.regNumber === "string" ? `${vehicle.regNumber}${typeof vehicle.makerModel === "string" ? ` (${vehicle.makerModel})` : ""}` : undefined,
  };
}

/** Retrieve and normalize Appwrite records for dashboard and application tracking. */
export async function listUserDemoApplications(userId: string) {
  const documents = await listUserApplications(userId);
  return documents.flatMap((document) => {
    const application = applicationDocumentToDemo(document);
    return application ? [application] : [];
  });
}

export async function findUserApplicationByNumber(userId: string, applicationNumber: string) {
  const applications = await listUserDemoApplications(userId);
  return applications.find((application) => application.id.toUpperCase() === applicationNumber.trim().toUpperCase()) || null;
}

// ==========================================
// Vehicle Table Functions
// ==========================================

/** Fetch vehicle registration details by vehicle registration number */
export async function getVehicleByRegNumber(regNumber: string) {
  requireAppwriteConfiguration();
  if (!appwriteDatabaseId) return null;

  const formattedReg = regNumber.trim().toUpperCase();

  try {
    const result = await databases.listDocuments({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteVehicleCollectionId,
    });
    const match = result.documents.find((doc) => {
      const item = doc as unknown as Record<string, unknown>;
      return (
        (typeof item.regNumber === "string" && item.regNumber.toUpperCase() === formattedReg) ||
        (typeof item.reg_number === "string" && item.reg_number.toUpperCase() === formattedReg)
      );
    });
    if (match) return match as unknown as VehicleRecord;
  } catch (error) {
    console.error("Failed to fetch vehicle from Appwrite:", error);
  }

  return null;
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

/** Store synthetic/demo document metadata, scoped to the signed-in user or guest session. */
export async function saveWalletDocument(document: WalletDocument) {
  if (!isAppwriteConfigured || !appwriteDatabaseId || !appwriteDocumentsCollectionId) {
    return null;
  }
  
  let userId = "guest_user";
  let permissions = [
    Permission.read(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any()),
  ];

  try {
    const user = await account.get();
    if (user?.$id) {
      userId = user.$id;
      permissions = [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ];
    }
  } catch {
    // Guest role: continue with fallback permissions
  }

  try {
    const existing = await databases.listDocuments({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteDocumentsCollectionId,
      queries: [Query.equal("userId", userId), Query.equal("number", document.number)],
    });

    if (existing.documents[0]) {
      return await databases.updateDocument({
        databaseId: appwriteDatabaseId,
        collectionId: appwriteDocumentsCollectionId,
        documentId: existing.documents[0].$id,
        data: { ...document, userId },
        permissions,
      });
    }

    return await databases.createDocument({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteDocumentsCollectionId,
      documentId: "unique()",
      data: { ...document, userId },
      permissions,
    });
  } catch (err) {
    console.warn("Could not save wallet document to Appwrite:", err);
    return null;
  }
}

export async function listWalletDocuments() {
  if (!isAppwriteConfigured || !appwriteDatabaseId || !appwriteDocumentsCollectionId) return [];
  try {
    let userId = "guest_user";
    try {
      const user = await account.get();
      if (user?.$id) userId = user.$id;
    } catch {
      // Guest role
    }

    const result = await databases.listDocuments({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteDocumentsCollectionId,
      queries: [Query.equal("userId", userId)],
    });
    return result.documents as unknown as Array<WalletDocument & { $id: string }>;
  } catch (error) {
    console.warn("Failed to list wallet documents from Appwrite:", error);
    return [];
  }
}

/** Upload a user-selected document to the configured private wallet bucket. */
export async function uploadWalletFile(file: File) {
  requireAppwriteConfiguration();
  if (!appwriteDocumentsBucketId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_DOCUMENTS_BUCKET_ID is not set.");
  }

  let permissions = [
    Permission.read(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any()),
  ];

  try {
    const user = await account.get();
    if (user?.$id) {
      permissions = [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ];
    }
  } catch {
    // Guest role: continue with fallback permissions
  }

  return storage.createFile({
    bucketId: appwriteDocumentsBucketId,
    fileId: ID.unique(),
    file,
    permissions,
  });
}

/** List files available to the current Appwrite user in the private wallet bucket. */
export async function listWalletFiles() {
  if (!isAppwriteConfigured || !appwriteDocumentsBucketId) return [];
  try {
    const result = await storage.listFiles({
      bucketId: appwriteDocumentsBucketId,
    });
    return result.files;
  } catch {
    return [];
  }
}

/** Generate an authenticated view URL for a private wallet file. */
export function getWalletFileViewUrl(fileId: string) {
  requireAppwriteConfiguration();
  if (!appwriteDocumentsBucketId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_DOCUMENTS_BUCKET_ID is not set.");
  }
  return storage.getFileView({ bucketId: appwriteDocumentsBucketId, fileId });
}

/** Rename an existing private wallet file without changing its access controls. */
export async function renameWalletFile(fileId: string, name: string) {
  requireAppwriteConfiguration();
  if (!appwriteDocumentsBucketId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_DOCUMENTS_BUCKET_ID is not set.");
  }
  return storage.updateFile({
    bucketId: appwriteDocumentsBucketId,
    fileId,
    name,
  });
}

/** Delete a private wallet file and its matching wallet metadata record. */
export async function deleteWalletFile(fileId: string) {
  requireAppwriteConfiguration();
  if (!appwriteDocumentsBucketId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_DOCUMENTS_BUCKET_ID is not set.");
  }
  
  let userId = "guest_user";
  try {
    const user = await account.get();
    if (user?.$id) userId = user.$id;
  } catch {
    // Guest role
  }

  await storage.deleteFile({ bucketId: appwriteDocumentsBucketId, fileId });

  if (!appwriteDatabaseId || !appwriteDocumentsCollectionId) return;
  try {
    const records = await databases.listDocuments({
      databaseId: appwriteDatabaseId,
      collectionId: appwriteDocumentsCollectionId,
      queries: [Query.equal("userId", userId), Query.equal("number", fileId)],
    });
    await Promise.all(records.documents.map((record) => databases.deleteDocument({
      databaseId: appwriteDatabaseId!,
      collectionId: appwriteDocumentsCollectionId!,
      documentId: record.$id,
    })));
  } catch {
    // The file is already deleted; metadata cleanup will be retried on a later save.
  }
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
