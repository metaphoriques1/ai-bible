
import React, { useState } from 'react';
import { CommunityGroup } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import TextArea from './common/TextArea';
import { SAMPLE_COMMUNITY_GROUPS } from '../services/MockDb';
import { UsersIcon, ChevronDownIcon } from './common/IconComponents';
import Select from './common/Select'; // Using common Select component

const CommunityConnect: React.FC = () => {
  const [groups] = useState<CommunityGroup[]>(SAMPLE_COMMUNITY_GROUPS);
  const [filterFocus, setFilterFocus] = useState<string>('');

  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [selectedGroupForModal, setSelectedGroupForModal] = useState<CommunityGroup | null>(null);
  const [joinMessage, setJoinMessage] = useState<string>('');

  const availableFocusAreas = Array.from(new Set(SAMPLE_COMMUNITY_GROUPS.map(g => g.focusArea)))
    .map(area => ({ value: area, label: area }));

  const filteredGroups = groups.filter(group => 
    filterFocus ? group.focusArea === filterFocus : true
  );

  const handleOpenJoinModal = (group: CommunityGroup) => {
    setSelectedGroupForModal(group);
    setJoinMessage('');
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
    setSelectedGroupForModal(null);
    setJoinMessage('');
  };

  const handleSubmitJoinRequest = () => {
    if (!selectedGroupForModal) return;

    // Simulated action: In a real app, this would call an API
    if (selectedGroupForModal.isPrivate) {
      console.log(`User requested to join private group: ${selectedGroupForModal.name} (ID: ${selectedGroupForModal.id}) with message: "${joinMessage}"`);
      alert(`Your request to join "${selectedGroupForModal.name}" has been sent to the group admin for approval!`);
    } else {
      console.log(`User joined public group: ${selectedGroupForModal.name} (ID: ${selectedGroupForModal.id})`);
      alert(`You have successfully joined "${selectedGroupForModal.name}"! Welcome to the community.`);
    }
    handleCloseJoinModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <UsersIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">Community Connect</h1>
      </div>
      <p className="text-brand-text-secondary text-base">Find groups to grow with and deepen your connections.</p>

      <Card title="Find Your Community" titleClassName="font-display text-2xl">
        <div className="mb-6">
          <Select
            label="Filter by Focus Area:"
            name="focusFilter"
            value={filterFocus}
            onChange={(e) => setFilterFocus(e.target.value)}
            options={[{ value: "", label: "All Areas" }, ...availableFocusAreas]}
            placeholder="All Focus Areas"
            containerClassName="max-w-sm"
          />
        </div>
        
        {filteredGroups.length === 0 && <p className="text-brand-text-secondary text-center py-4">No groups match your current filter. Try broadening your search!</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <Card key={group.id} className="hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-brand-primary mb-1">{group.name}</h3>
                <span className="text-xs text-brand-accent-darker bg-brand-accent/20 inline-block px-2.5 py-0.5 rounded-full mb-2 font-medium">{group.focusArea}</span>
                <p className="text-sm text-brand-text-secondary mb-3 leading-relaxed">{group.description}</p>
              </div>
              <div className="flex justify-between items-center text-sm mt-auto pt-3 border-t border-brand-primary/10">
                <span className="text-brand-text-secondary flex items-center">
                  <UsersIcon className="w-4 h-4 mr-1.5 text-gray-400"/> {group.membersCount} members
                </span>
                <Button size="sm" variant="outline" onClick={() => handleOpenJoinModal(group)}>
                  {group.isPrivate ? 'Request to Join' : 'Join Group'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {selectedGroupForModal && (
        <Modal 
          isOpen={isJoinModalOpen} 
          onClose={handleCloseJoinModal} 
          title={selectedGroupForModal.isPrivate ? `Request to Join: ${selectedGroupForModal.name}` : `Join Group: ${selectedGroupForModal.name}`}
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={handleCloseJoinModal}>Cancel</Button>
              <Button onClick={handleSubmitJoinRequest} variant="primary">
                {selectedGroupForModal.isPrivate ? 'Send Request' : 'Confirm Join'}
              </Button>
            </div>
          }
        >
          {selectedGroupForModal.isPrivate ? (
            <>
              <p className="text-brand-text-secondary mb-4 text-base">
                "{selectedGroupForModal.name}" is a private group. You can add an optional message to the group admin below.
              </p>
              <TextArea
                label="Optional Message"
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="Introduce yourself or explain why you'd like to join..."
                rows={3}
              />
            </>
          ) : (
            <p className="text-brand-text-secondary text-base">
              You are about to join the public group "{selectedGroupForModal.name}". Click 'Confirm Join' to become a member.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CommunityConnect;
