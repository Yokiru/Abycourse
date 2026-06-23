import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "./env";
import { getAdminByPublicId } from "./db/queries";

const SESSION_COOKIE = "eci_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;

function sign(value: string) {
  return createHmac("sha256", env.sessionSecret).update(value).digest("hex");
}

function encodeSession(publicId: string, expiresAt: number) {
  const payload = `${publicId}.${expiresAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function decodeSession(value: string) {
  const [publicId, expiresAtRaw, signature] = value.split(".");

  if (!publicId || !expiresAtRaw || !signature) {
    return null;
  }

  const payload = `${publicId}.${expiresAtRaw}`;
  const expectedSignature = sign(payload);

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return null;
  }

  return { publicId, expiresAt };
}

export async function createAdminSession(publicId: string) {
  const jar = await cookies();
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  jar.set(
    SESSION_COOKIE,
    encodeSession(publicId, expiresAt),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      expires: new Date(expiresAt),
      path: "/",
    },
  );
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  const session = decodeSession(raw);

  if (!session) {
    return null;
  }

  return await getAdminByPublicId(session.publicId);
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
