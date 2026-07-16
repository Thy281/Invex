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
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'operator', 'viewer'] },
  { to: '/products', icon: Package, label: 'Products', roles: ['admin', 'manager', 'operator'] },
  { to: '/inventory', icon: Warehouse, label: 'Inventory', roles: ['admin', 'manager', 'operator'] },
  { to: '/movements', icon: ArrowRightLeft, label: 'Movements', roles: ['admin', 'manager', 'operator'] },
  { to: '/suppliers', icon: Truck, label: 'Suppliers', roles: ['admin', 'manager'] },
  { to: '/locations', icon: MapPin, label: 'Locations', roles: ['admin', 'manager'] },
  { to: '/purchase-orders', icon: ClipboardList, label: 'Purchase Orders', roles: ['admin', 'manager'] },
  { to: '/alerts', icon: Bell, label: 'Alerts', roles: ['admin'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'manager', 'viewer'] },
  { to: '/users', icon: Users, label: 'Users', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
]

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const visible = navItems.filter((item) => item.roles.includes(user?.role ?? 'viewer'))

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Package className="h-6 w-6 text-primary-600" />
        <span className="text-lg font-bold">Invex</span>
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
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 text-sm text-gray-500">{user?.email}</div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
