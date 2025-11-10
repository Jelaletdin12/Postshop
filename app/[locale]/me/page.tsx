import type { Metadata } from "next"
import ClientProfilePage from "./client-page"

export const metadata: Metadata = {
  title: "My Profile | E-Commerce",
  description: "Manage your profile settings",
  robots: "noindex, nofollow", // Private page
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return <ClientProfilePage params={params} />
}
