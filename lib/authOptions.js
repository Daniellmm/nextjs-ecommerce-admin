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
      return adminEmails.includes(user.email);
    },
    async session({ session }) {
      session.user.role = adminEmails.includes(session?.user?.email)
        ? "admin"
        : "unauthorized";
      return session;
    },
  },
};
