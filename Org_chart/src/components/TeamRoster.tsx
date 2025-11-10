import { TeamMember } from '../types';
import { TeamMemberCard } from './TeamMemberCard';
import { Users } from 'lucide-react';

interface TeamRosterProps {
  members: TeamMember[];
  assignedMemberIds: Set<string>;
}

export function TeamRoster({ members, assignedMemberIds }: TeamRosterProps) {
  const availableMembers = members.filter((m) => !assignedMemberIds.has(m.id));
  const assignedMembers = members.filter((m) => assignedMemberIds.has(m.id));

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-slate-700" />
          <h2 className="font-semibold text-slate-800 text-lg">Team Roster</h2>
        </div>
        <p className="text-xs text-slate-600">
          {availableMembers.length} available · {assignedMembers.length} assigned
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {availableMembers.length > 0 ? (
          <div className="space-y-3">
            {availableMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Users className="w-12 h-12 mb-2" />
            <p className="text-sm text-center">All team members have been assigned</p>
          </div>
        )}

        {assignedMembers.length > 0 && (
          <>
            <div className="my-4 border-t border-slate-200" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Assigned Members
            </h3>
            <div className="space-y-3 opacity-60">
              {assignedMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} disabled />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
