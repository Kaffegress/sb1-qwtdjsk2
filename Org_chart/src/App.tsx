import { useHierarchyData } from './hooks/useHierarchyData';
import { HierarchyToolbar } from './components/HierarchyToolbar';
import { OrgChart } from './components/OrgChart';
import { TeamRoster } from './components/TeamRoster';

function App() {
  const {
    project,
    teamMembers,
    hierarchyTree,
    assignMemberToNode,
    removeMemberFromNode,
    addNewNode,
    resetData,
    assignedMemberIds,
  } = useHierarchyData();

  const handleAddNode = () => {
    if (hierarchyTree.length > 0) {
      addNewNode(hierarchyTree[0].id);
    } else {
      addNewNode(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <HierarchyToolbar
        projectName={project.name}
        onAddNode={handleAddNode}
        onReset={resetData}
      />

      <div className="flex-1 flex overflow-hidden">
        <TeamRoster members={teamMembers} assignedMemberIds={assignedMemberIds} />

        <OrgChart
          nodes={hierarchyTree}
          onDropOnNode={assignMemberToNode}
          onRemoveMember={removeMemberFromNode}
        />
      </div>
    </div>
  );
}

export default App;
