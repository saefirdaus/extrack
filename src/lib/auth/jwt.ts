import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "auth_token";

const FALLBACK_JWT_SECRET = "extrack-development-secret-change-me";

function getJwtSecret(): string {
  const configuredSecret = process.env.JWT_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured in production");
  }

  return FALLBACK_JWT_SECRET;
}

const JWT_SECRET = getJwtSecret();

export type SessionPayload = {
  userId: number;
  email: string;
  name: string;
};

function hasSessionPayload(
  payload: string | JwtPayload,
): payload is JwtPayload & SessionPayload {
  return (
    typeof payload !== "string" &&
    typeof payload.userId === "number" &&
    typeof payload.email === "string" &&
    typeof payload.name === "string"
  );
}

export function signToken(payload: SessionPayload): string {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: "1d",
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!hasSessionPayload(payload)) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
