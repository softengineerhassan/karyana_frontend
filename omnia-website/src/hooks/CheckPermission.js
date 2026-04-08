import { useMemo } from 'react'
import { useSelector } from 'react-redux'

const CheckPermission = () => {
  const { permissions } = useSelector(state => state?.auth)
  const permissionsConvert = useMemo(() => {
    const permMap = {}
    permissions?.forEach(({ module, permissions: perms }) => {
      perms?.forEach(permission => {
        permMap[`${module}-${permission}`] = true
      })
    })

    return permMap
  }, [permissions])

  const hasPermission = (module, action) => {
    return permissionsConvert[`${module}-${action}`] || false
  }

  return { hasPermission }
}

export default CheckPermission
