import { getSession } from '@/lib/session/verify-session'
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
  const session = await getSession()
  // TEMP DIAGNOSTIC — remove once the 307 redirect loop is resolved
  console.log('AdminLayout session:', session)
  if (!session) {
    console.log('AdminLayout: no session, redirecting to /login')
    redirect('/login')
  }

  await connectDB()
  const user = await User.findOne({ uid: session.uid })
  // TEMP DIAGNOSTIC — remove once the 307 redirect loop is resolved
  console.log('AdminLayout user lookup:', { sessionUid: session.uid, foundUser: user })
  if (!user || user.role !== 'admin') {
    console.log('AdminLayout: role check failed, redirecting to /', {
      foundUser: !!user,
      role: user?.role,
    })
    redirect('/')
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 p-6">{children}</div>
    </>
  )
}