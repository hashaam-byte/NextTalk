import NextAuth from "next-auth";
import { authOptions } from "@/lib/authConfig";

// @ts-ignore - Suppress type errors for NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
