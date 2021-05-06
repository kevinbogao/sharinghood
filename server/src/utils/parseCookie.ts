// @ts-nocheck
// Parse cookie from string to object
export default function parseCookie(cookies) {
  return cookies
    .split(";")
    .map((cookie) => cookie.split("="))
    .reduce((acc, cookie) => {
      acc[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(
        cookie[1].trim()
      );
      return acc;
    }, {});
}
