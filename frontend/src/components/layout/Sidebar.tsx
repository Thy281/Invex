import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowRightLeft,
  Truck,
  MapPin,
  ClipboardList,
  Bell,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'nav.dashboard', roles: ['admin', 'manager', 'operator', 'viewer'] },
  { to: '/products', icon: Package, label: 'nav.products', roles: ['admin', 'manager', 'operator'] },
  { to: '/inventory', icon: Warehouse, label: 'nav.inventory', roles: ['admin', 'manager', 'operator'] },
  { to: '/movements', icon: ArrowRightLeft, label: 'nav.movements', roles: ['admin', 'manager', 'operator'] },
  { to: '/suppliers', icon: Truck, label: 'nav.suppliers', roles: ['admin', 'manager'] },
  { to: '/locations', icon: MapPin, label: 'nav.locations', roles: ['admin', 'manager'] },
  { to: '/purchase-orders', icon: ClipboardList, label: 'nav.purchaseOrders', roles: ['admin', 'manager'] },
  { to: '/alerts', icon: Bell, label: 'nav.alerts', roles: ['admin'] },
  { to: '/analytics', icon: BarChart3, label: 'nav.analytics', roles: ['admin', 'manager', 'viewer'] },
  { to: '/users', icon: Users, label: 'nav.users', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'nav.settings', roles: ['admin'] },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const visible = navItems.filter((item) => item.roles.includes(user?.role ?? 'viewer'))

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-700">
        <Package className="h-6 w-6 text-primary-600" />
        <span className="text-lg font-bold dark:text-white">Invex</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          {t('nav.signOut')}
        </button>
      </div>
    </aside>
  )
}
