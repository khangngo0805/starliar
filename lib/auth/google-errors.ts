export function googleErrorMessage(error?: string) {
  switch (error) {
    case "not_configured":
      return "Google sign-in is not configured for this deployment yet.";
    case "token_exchange":
      return "Google rejected this sign-in request. Check the OAuth redirect URI.";
    case "state":
      return "Google sign-in expired. Please try again.";
    case "email_not_verified":
      return "Your Google email must be verified before signing in.";
    case "profile":
      return "Google profile could not be loaded. Please try again.";
    case "unknown":
    case "1":
      return "Google sign-in could not be completed.";
    default:
      return null;
  }
}
