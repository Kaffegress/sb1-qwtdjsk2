import { Plus, RotateCcw, Layers } from 'lucide-react';

interface HierarchyToolbarProps {
  projectName: string;
  onAddNode: () => void;
  onReset: () => void;
}

export function HierarchyToolbar({ projectName, onAddNode, onReset }: HierarchyToolbarProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{projectName}</h1>
            <p className="text-xs text-slate-600">Project Hierarchy Planning</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo
          </button>
          <button
            onClick={onAddNode}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        </div>
      </div>
    </div>
  );
}
