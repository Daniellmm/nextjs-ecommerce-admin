
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

const adminEmails = [
  "idowudanielcsc190400@gmail.com",
  "danielidowu098@gmail.com",
];

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user }) {
      // Block login for non-admins
      if (adminEmails.includes(user.email)) {
        return true; 
      }
      // console.log(`Blocked login for non-admin: ${user.email}`);
      return false; 
    },
    async session({ session }) {
      // Optional: Add role to session (can help on frontend)
      session.user.role = adminEmails.includes(session?.user?.email) ? "admin" : "unauthorized";
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
