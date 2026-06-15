import { requireSession } from '@/lib/session/get-session'
import { User } from '@/models'
import { connectDB } from '@/lib/mongodb/client'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side admin check
  const session = await requireSession()
  await connectDB()
  const user = await User.findOne({ uid: session.uid })
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 p-6">{children}</div>
    </>
  )
}