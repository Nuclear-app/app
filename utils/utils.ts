import { redirect } from "next/navigation";

/**
 * Creates a URL with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {string} The URL with the encoded message.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  const url = `${path}?${type}=${encodeURIComponent(message)}`;
  return redirect(url);
}
