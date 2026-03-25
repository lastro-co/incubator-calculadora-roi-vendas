'use client';

import { useMemo } from 'react';
import { useUserInfo } from './useUserInfo';

interface UsePermissionsReturn {
  /** Check if user has a specific role */
  hasRole: (role: string) => boolean;
  /** Check if user has any of the provided roles */
  hasAnyRole: (roles: string[]) => boolean;
  /** Check if user has all of the provided roles */
  hasAllRoles: (roles: string[]) => boolean;
  /** Check if user is in a specific group */
  inGroup: (group: string) => boolean;
  /** Check if user is in any of the provided groups */
  inAnyGroup: (groups: string[]) => boolean;
  /** User's roles array */
  roles: string[];
  /** User's groups array */
  groups: string[];
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook for managing user permissions and roles
 *
 * @example
 * const { hasRole, hasAnyRole, inGroup } = usePermissions();
 *
 * if (hasRole('admin')) {
 *   // Show admin interface
 * }
 *
 * if (hasAnyRole(['manager', 'supervisor'])) {
 *   // Show management features
 * }
 */
export function usePermissions(): UsePermissionsReturn {
  const { data: userInfo, isLoading } = useUserInfo();

  const permissions = useMemo(() => {
    const roles = userInfo?.roles || [];
    const groups = userInfo?.groups || [];

    const hasRole = (role: string): boolean => {
      return roles.includes(role);
    };

    const hasAnyRole = (requiredRoles: string[]): boolean => {
      return requiredRoles.some((role) => roles.includes(role));
    };

    const hasAllRoles = (requiredRoles: string[]): boolean => {
      return requiredRoles.every((role) => roles.includes(role));
    };

    const inGroup = (group: string): boolean => {
      return groups.includes(group);
    };

    const inAnyGroup = (requiredGroups: string[]): boolean => {
      return requiredGroups.some((group) => groups.includes(group));
    };

    return {
      hasRole,
      hasAnyRole,
      hasAllRoles,
      inGroup,
      inAnyGroup,
      roles,
      groups,
      isLoading,
    };
  }, [userInfo, isLoading]);

  return permissions;
}
