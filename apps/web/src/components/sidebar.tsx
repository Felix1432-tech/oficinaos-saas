'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Car,
  FileText,
  Package,
  Image,
  Globe,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM', href: '/crm', icon: Kanban },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Veículos', href: '/vehicles', icon: Car },
  { name: 'Orçamentos', href: '/proposals', icon: FileText },
  { name: 'Catálogo', href: '/catalog', icon: Package },
  { name: 'Mídias', href: '/media', icon: Image },
  { name: 'Landing Page', href: '/landing-config', icon: Globe },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">O</span>
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900">OficinaOS</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <Link
                href="/settings"
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary"
              >
                <Settings className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-primary" />
                Configurações
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
