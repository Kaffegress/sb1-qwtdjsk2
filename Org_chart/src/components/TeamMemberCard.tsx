import { TeamMember } from '../types';
import { Mail } from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
  disabled?: boolean;
}

export function TeamMemberCard({ member, disabled = false }: TeamMemberCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('memberId', member.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      className={`
        bg-white rounded-lg border-2 border-slate-200 overflow-hidden transition-all
        ${disabled ? 'cursor-not-allowed' : 'cursor-move hover:border-blue-400 hover:shadow-md hover:scale-[1.02]'}
      `}
    >
      <div className="flex items-start gap-3 p-3">
        <img
          src={member.photo_url}
          alt={member.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm truncate">
            {member.name}
          </h3>
          <p className="text-xs text-blue-600 font-medium mb-1">{member.role_type}</p>
          {member.email && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Mail className="w-3 h-3" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
        </div>
      </div>

      {member.bio && (
        <div className="px-3 pb-2">
          <p className="text-xs text-slate-600 line-clamp-2">{member.bio}</p>
        </div>
      )}

      {member.skills.length > 0 && (
        <div className="px-3 pb-3">
          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                +{member.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
