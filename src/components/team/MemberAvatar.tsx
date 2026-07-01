import { cn, getInitials, getMemberAvatarColor } from '../../lib/utils'
import type { TeamMember } from '../../lib/types'

interface MemberAvatarProps {
  member: TeamMember
  size?: 'sm' | 'md'
}

export function MemberAvatar({ member, size = 'sm' }: MemberAvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-surface-card',
        size === 'sm' && 'h-6 w-6 text-[10px]',
        size === 'md' && 'h-8 w-8 text-xs',
      )}
      style={{ backgroundColor: getMemberAvatarColor(member.id) }}
      title={member.name}
    >
      {getInitials(member.name)}
    </div>
  )
}

interface MemberAvatarGroupProps {
  members: TeamMember[]
  max?: number
}

export function MemberAvatarGroup({ members, max = 3 }: MemberAvatarGroupProps) {
  const visible = members.slice(0, max)
  const overflow = members.length - max

  return (
    <div className="flex -space-x-1.5">
      {visible.map((member) => (
        <MemberAvatar key={member.id} member={member} />
      ))}
      {overflow > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-overlay text-[10px] font-medium text-text-secondary ring-2 ring-surface-card">
          +{overflow}
        </div>
      )}
    </div>
  )
}
