
import { getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "@/app/api/auth/[...nextauth]/route";

const adminEmails = [
    "idowudanielcsc190400@gmail.com",
    "danielidowu098@gmail.com",
];

export const authOptions = nextAuthOptions;

export async function isAdminRequest(request) {
    const session = await getServerSession(authOptions);
    // console.log("Session in isAdminRequest:", session);

    if (session?.user?.role !== 'admin') {
        throw new Error(`Not an admin: ${session?.user?.email}`);
    }
}