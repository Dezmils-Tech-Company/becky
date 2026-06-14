import Link from 'next/link'
import { PageWrapper } from './PageWrapper'

const FOOTER_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'My orders', href: '/orders' },
  { label: 'Profile', href: '/profile' }
]

/**
 * Site footer: navigation links and copyright.
 */
export function Footer(): React.ReactNode {
  return (
    <footer className="border-t border-neutral-100 bg-white">
      <PageWrapper className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <p className="text-sm font-semibold text-neutral-900">Becky Hive</p>

        <nav aria-label="Footer">
          <ul className="flex gap-6">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-neutral-500 transition-colors hover:text-pink-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-sm text-neutral-400">
          &copy; {new Date().getFullYear()} Becky Hive. All rights reserved.
        </p>
      </PageWrapper>
    </footer>
  )
}