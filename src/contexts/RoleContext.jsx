import { createContext, useContext, useState } from 'react'
import { ROLES } from '../data/constants'

const RoleContext = createContext(null)

const STORAGE_KEY = 'eco_role'

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return Object.values(ROLES).includes(saved) ? saved : null
  })

  const selectRole = (newRole) => {
    localStorage.setItem(STORAGE_KEY, newRole)
    setRole(newRole)
  }

  const clearRole = () => {
    localStorage.removeItem(STORAGE_KEY)
    setRole(null)
  }

  return (
    <RoleContext.Provider value={{ role, selectRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used inside RoleProvider')
  return ctx
}
