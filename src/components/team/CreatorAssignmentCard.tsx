import { ClipboardCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { StatFigure, StatsCard } from '@/components/team/StatsCard';
import type { CreatorAssignment } from '@/services/teamService';

// The Assign Creators card: how many creators the agency has, then how many are assigned,
// unassigned and waiting on approval.

export function CreatorAssignmentCard({ assignment }: { assignment: CreatorAssignment }) {
  const breakdown = [
    { label: 'Assigned Creators', value: assignment.assigned, color: '#111111' },
    { label: 'Unassigned Creators', value: assignment.unassigned, color: '#3A7DE8' },
    { label: 'Pending Approvals', value: assignment.pendingApprovals, color: '#4ACD6D' },
  ];

  return (
    <StatsCard
      title="Assign Creators"
      icon={ClipboardCheck}
      tone={{ color: '#059669', background: '#D1FAE5' }}
    >
      <View className="border-b border-black/[0.05] px-5 py-4">
        <StatFigure
          label="Total Creators"
          value={String(assignment.total)}
          caption={assignment.total === 1 ? 'Creator' : 'Creators'}
        />
      </View>
      <View className="flex-row">
        {breakdown.map((item, i) => (
          <View
            key={item.label}
            className={`flex-1 p-4 ${i > 0 ? 'border-l border-black/[0.05]' : ''}`}
          >
            <StatFigure label={item.label} value={String(item.value)} color={item.color} compact />
          </View>
        ))}
      </View>
    </StatsCard>
  );
}
