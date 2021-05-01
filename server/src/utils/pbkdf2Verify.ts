import crypto from "crypto";

// Returns a boolean value on password validity
export default function pbkdf2Verify(password: string, hash: string): any {
  return new Promise((resolve, reject) => {
    // Get digest, iterations, salt and key from hash
    const hashArr = hash.split("$");
    const digest = hashArr[0].split("_")[1];
    const iterations = +hashArr[1];
    const salt = hashArr[2];
    const key = hashArr[3];

    // Compare hash key with derivedKey
    crypto.pbkdf2(password, salt, iterations, 32, digest, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString("base64") === key);
    });
  });
}
