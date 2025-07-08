import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";

const adminEmails = ['idowudanielcsc190400@gmail.com'];

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async session({ session }) {
      if (adminEmails.includes(session?.user?.email)) {
        return session;
      }
      return null;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Export the isAdminRequest function
export async function isAdminRequest(request) {
  const session = await getServerSession(authOptions);
  // console.log("Session in isAdminRequest:", session);
  if (!adminEmails.includes(session?.user?.email)) {
    throw new Error('not an admin');
  }
}