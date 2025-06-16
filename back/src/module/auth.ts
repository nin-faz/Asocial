import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

export const createJWT = (user: User) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "5d",
    }
  );

  return token;
};

export type AuthenticatedUser = Pick<User, "id" | "username">;

export const getUser = (token: string): AuthenticatedUser | null => {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthenticatedUser;
    return payload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      console.error("Token expiré !");
    } else {
      console.error("Erreur de vérification :", err);
    }
    return null;
  }
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 5);
};
