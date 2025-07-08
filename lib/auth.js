import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Now safe

export async function isAdminRequest(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error(`Not an admin: ${session?.user?.email}`);
  }
}
