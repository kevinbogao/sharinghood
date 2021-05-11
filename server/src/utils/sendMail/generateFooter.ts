import crypto from "crypto";
import { redis } from "../../index";

export default async function generateFooter(
  recipientId: string
): Promise<string> {
  let unsubscribeToken: string | null;
  unsubscribeToken = await redis.get(`unsubscribe_token:${recipientId}`);

  if (!unsubscribeToken) {
    unsubscribeToken = crypto.randomBytes(16).toString("hex");
    await redis.set(`unsubscribe_token:${recipientId}`, unsubscribeToken);
  }

  return `
    <div class="separator" />
    </div>
    <div class="footer">
      <a class="footer-text" href="${process.env.ORIGIN}/unsubscribe/${recipientId}/${unsubscribeToken}"
        >Unsubscribe
      </a>
      <p class="dot">·</p>
      <a class="footer-text" href="${process.env.ORIGIN}/login">
        Sign in to sharinghood
      </a>
    </div>
    <p class="footer-text">Contact us any time via: sharinghood@gmail.com</p>
  `;
}
