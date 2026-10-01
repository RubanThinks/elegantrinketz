import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export class AuthError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export interface AuthenticatedAdmin {
  uid: string;
  email: string;
  role: "admin" | "super_admin";
  isSuperAdmin: boolean;
}

/**
 * Server-side helper to verify a caller's Firebase Auth ID token
 * and ensure they possess active admin or super_admin privileges.
 *
 * Flow:
 * 1. Extract Bearer token from Authorization header.
 * 2. Verify token validity via Google Identity Toolkit.
 * 3. Inspect Firestore users collection for active admin/super_admin role.
 *
 * Never leaks internal stack traces, API keys, or credentials.
 */
export async function verifyAdminRequest(
  request: Request
): Promise<AuthenticatedAdmin> {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError(401, "Authentication required. Please sign in as an administrator.");
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new AuthError(401, "Authentication token is missing or malformed.");
  }

  // Support local test harness without exposing production bypass
  if (process.env.NODE_ENV === "test" && token.startsWith("test-token-")) {
    const role = token.replace("test-token-", "") as "admin" | "super_admin" | "customer";
    if (role !== "admin" && role !== "super_admin") {
      throw new AuthError(403, "Access denied. Administrator privileges required.");
    }
    return {
      uid: `test-${role}-uid`,
      email: `${role}@example.com`,
      role,
      isSuperAdmin: role === "super_admin",
    };
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    console.error("[verifyAdminRequest] Missing NEXT_PUBLIC_FIREBASE_API_KEY configuration.");
    throw new AuthError(500, "Authentication service is temporarily unavailable.");
  }

  let uid: string;
  let email: string = "";

  try {
    const lookupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!lookupRes.ok) {
      throw new AuthError(401, "Invalid or expired session. Please sign in again.");
    }

    const data = await lookupRes.json();
    const user = data.users?.[0];

    if (!user || !user.localId) {
      throw new AuthError(401, "Invalid token credentials.");
    }

    uid = user.localId;
    email = user.email || "";
  } catch (err) {
    if (err instanceof AuthError) throw err;
    console.error("[verifyAdminRequest] Token lookup error:", (err as Error).message);
    throw new AuthError(401, "Failed to authenticate session token.");
  }

  // Verify role directly from Firestore using the caller's authenticated ID token
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    let userData: any = null;

    if (projectId) {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
      const firestoreRes = await fetch(firestoreUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (firestoreRes.status === 404) {
        throw new AuthError(403, "User profile not found in system records.");
      }

      if (firestoreRes.ok) {
        const docJson = await firestoreRes.json();
        const rawFields = docJson.fields || {};
        userData = {};
        for (const [key, val] of Object.entries(rawFields as Record<string, any>)) {
          if (val && typeof val === "object") {
            if ("stringValue" in val) userData[key] = val.stringValue;
            else if ("booleanValue" in val) userData[key] = val.booleanValue;
            else if ("integerValue" in val) userData[key] = Number(val.integerValue);
            else if ("doubleValue" in val) userData[key] = Number(val.doubleValue);
            else if ("nullValue" in val) userData[key] = null;
          }
        }
      } else {
        const errJson = await firestoreRes.json().catch(() => ({}));
        console.warn("[verifyAdminRequest] Firestore REST lookup response:", firestoreRes.status, errJson);
      }
    }

    if (!userData) {
      // Fallback to client SDK if REST didn't resolve
      const db = getFirebaseDb();
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        throw new AuthError(403, "User profile not found in system records.");
      }

      userData = snap.data();
    }

    if (userData.isActive === false) {
      throw new AuthError(403, "Your administrator account has been deactivated.");
    }

    const role = userData.role;
    if (role !== "admin" && role !== "super_admin") {
      throw new AuthError(403, "Access denied. Administrator privileges required.");
    }

    return {
      uid,
      email: userData.email || email,
      role,
      isSuperAdmin: role === "super_admin",
    };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    console.error("[verifyAdminRequest] Firestore user role lookup failed:", (err as Error).message);
    throw new AuthError(500, "Unable to verify administrative authorization.");
  }
}
