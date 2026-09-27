// Central nav item definitions — imported by AppShell usage sites
import {
  Inbox, Plus, LayoutDashboard, List, Home,
} from 'lucide-react'

export const citizenNav = [
  { path: '/citizen/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/citizen/requests',  label: 'My requests', icon: Inbox },
  { path: '/citizen/new',       label: 'New request', icon: Plus  },
]

export const adminNav = [
  { path: '/admin/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/admin/requests',  label: 'All requests', icon: List             },
]
