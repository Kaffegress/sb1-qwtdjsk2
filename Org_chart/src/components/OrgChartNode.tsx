import { useState } from 'react';
import { HierarchyNodeWithAssignments } from '../types';
import { User, Plus } from 'lucide-react';

interface OrgChartNodeProps {
  node: HierarchyNodeWithAssignments;
  onDropOnNode: (nodeId: string, memberId: string) => void;
  onRemoveMember: (nodeId: string, memberId: string) => void;
}

export function OrgChartNode({ node, onDropOnNode, onRemoveMember }: OrgChartNodeProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const memberId = e.dataTransfer.getData('memberId');
    const sourceNodeId = e.dataTransfer.getData('sourceNodeId');

    if (memberId && memberId !== node.id) {
      setIsDropping(true);
      setTimeout(() => {
        onDropOnNode(node.id, memberId);
        setIsDropping(false);
        setIsDragOver(false);
      }, 300);
    } else if (sourceNodeId && sourceNodeId !== node.id) {
      setIsDropping(true);
      setTimeout(() => {
        const sourceMemberId = e.dataTransfer.getData('sourceMemberId');
        if (sourceMemberId) {
          onDropOnNode(node.id, sourceMemberId);
        }
        setIsDropping(false);
        setIsDragOver(false);
      }, 300);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    onRemoveMember(node.id, memberId);
  };

  const hasAssignments = node.assignments.length > 0;

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300
        ${isDragOver ? 'border-blue-500 scale-105 shadow-xl' : 'border-slate-200'}
        ${isDropping ? 'animate-bounce' : ''}
        w-64
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
        <h3 className="font-semibold text-slate-800 text-lg">{node.role_title}</h3>
        {node.role_description && (
          <p className="text-xs text-slate-600 mt-1">{node.role_description}</p>
        )}
      </div>

      <div className="p-4 min-h-[120px]">
        {hasAssignments ? (
          <div className="space-y-3">
            {node.assignments.map((assignment) => (
              <div
                key={assignment.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('sourceMemberId', assignment.member.id);
                  e.dataTransfer.setData('sourceNodeId', node.id);
                }}
                className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-move hover:bg-slate-100 transition-colors group"
              >
                <img
                  src={assignment.member.photo_url}
                  alt={assignment.member.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">
                    {assignment.member.name}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {assignment.member.role_type}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMember(assignment.member.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs px-2 py-1 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className={`
              w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center
              transition-all duration-300
              ${isDragOver ? 'border-blue-400 bg-blue-50 scale-110' : ''}
            `}>
              {isDragOver ? (
                <Plus className="w-6 h-6 text-blue-500" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <p className="text-xs mt-2 text-center">Drop team member here</p>
          </div>
        )}
      </div>
    </div>
  );
}
