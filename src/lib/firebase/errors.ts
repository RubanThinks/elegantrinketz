/**
 * Maps raw Firebase Authentication & Firestore error codes to friendly, actionable messages.
 * Never expose raw Firebase internal exception strings directly to end-users.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "An unexpected error occurred. Please try again.";
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || "";

  switch (code) {
    // Login / Credentials
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password. Please verify your details and try again.";

    // Registration
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters including letters and numbers.";
    case "auth/invalid-email":
      return "Please provide a valid email address.";

    // Google Sign In / Popup
    case "auth/popup-closed-by-user":
      return "Google Sign-In was cancelled. Please try again.";
    case "auth/cancelled-popup-request":
      return "Sign-in request was cancelled. Only one popup can be open at a time.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";

    // Account Status
    case "auth/user-disabled":
      return "This account has been deactivated. Please reach out to customer support.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Access is temporarily paused for your security. Please wait a few minutes.";

    // Network / Server
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is currently unavailable. Please contact the administrator.";

    // Firestore Permissions
    case "permission-denied":
      return "Access denied: You do not have permission to perform this action.";

    default:
      if (err.message && err.message.length < 80 && !err.message.includes("Firebase:")) {
        return err.message;
      }
      return "Authentication could not be completed. Please try again in a moment.";
  }
}
