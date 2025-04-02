/**
 * Formats a username to have the first letter capitalized without changing the case of other letters
 * @param username The username to format
 * @returns The formatted username
 */
export function formatUsername(username: string): string {
  if (!username || username.length === 0) return username;
  return username.charAt(0).toUpperCase() + username.slice(1);
}
