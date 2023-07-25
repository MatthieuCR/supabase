import { partition } from 'lodash'
import { useState } from 'react'

import { useParams } from 'common'
import { ScaffoldContainer, ScaffoldSection } from 'components/layouts/Scaffold'
import AlertError from 'components/ui/AlertError'
import TextConfirmModal from 'components/ui/Modals/TextConfirmModal'
import { GenericSkeletonLoader } from 'components/ui/ShimmeringLoader'
import { useBranchDeleteMutation } from 'data/branches/branch-delete-mutation'
import { useBranchUpdateMutation } from 'data/branches/branch-update-mutation'
import { Branch, useBranchesQuery } from 'data/branches/branches-query'
import { useStore } from 'hooks'
import { BranchHeader, BranchPanel } from './BranchPanels'

const BranchManagement = () => {
  const { ui } = useStore()
  const { ref: projectRef } = useParams()
  const [selectedBranchToUpdate, setSelectedBranchToUpdate] = useState<Branch>()
  const [selectedBranchToDelete, setSelectedBranchToDelete] = useState<Branch>()

  const { data: branches, error, isLoading, isError, isSuccess } = useBranchesQuery({ projectRef })
  const [[mainBranch], previewBranches] = partition(branches, (branch) => branch.is_default)

  const { mutate: updateBranch, isLoading: isUpdating } = useBranchUpdateMutation({
    onSuccess: () => {
      setSelectedBranchToUpdate(undefined)
      ui.setNotification({ category: 'success', message: 'Successfully updated branch' })
    },
  })
  const { mutate: deleteBranch, isLoading: isDeleting } = useBranchDeleteMutation({
    onSuccess: () => {
      setSelectedBranchToDelete(undefined)
      ui.setNotification({ category: 'success', message: 'Successfully deleted branch' })
    },
  })

  const onConfirmDeleteBranch = () => {
    if (selectedBranchToDelete == undefined) return console.error('No branch selected')
    if (projectRef == undefined) return console.error('Project ref is required')
    deleteBranch({ id: selectedBranchToDelete?.id, projectRef })
  }

  return (
    <>
      <ScaffoldContainer>
        <ScaffoldSection>
          <div className="col-span-12">
            <h3 className="text-lg">Branches</h3>
            <div className="mt-8">
              {isLoading && <GenericSkeletonLoader />}
              {isError && <AlertError error={error} subject="Failed to retrieve branches" />}
              {isSuccess && (
                <>
                  <BranchPanel branch={mainBranch} onSelectUpdate={() => {}} />
                  <BranchHeader markdown={`#### Preview branches`} />
                  {previewBranches.map((branch) => (
                    <BranchPanel
                      key={branch.id}
                      branch={branch}
                      onSelectUpdate={() => {}}
                      onSelectDelete={() => setSelectedBranchToDelete(branch)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </ScaffoldSection>
      </ScaffoldContainer>

      <TextConfirmModal
        size="medium"
        visible={selectedBranchToDelete !== undefined}
        onCancel={() => setSelectedBranchToDelete(undefined)}
        onConfirm={() => onConfirmDeleteBranch()}
        title="Delete branch"
        loading={isDeleting}
        confirmLabel={`Delete branch`}
        confirmPlaceholder="Type in name of branch"
        confirmString={selectedBranchToDelete?.name ?? ''}
        text={`This will delete your branch "${selectedBranchToDelete?.name}"`}
        alert="You cannot recover this branch once it is deleted!"
      />
    </>
  )
}

export default BranchManagement