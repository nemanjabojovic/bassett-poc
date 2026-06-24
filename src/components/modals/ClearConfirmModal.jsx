const ClearConfirmModal = ({ onConfirm, onCancel }) => (
  <div className='modal-overlay'>
    <div className='modal'>
      <button className='modal-dismiss' onClick={onCancel}>&#10005;</button>
      <p className='modal-title'>Are you sure you want to clear the configuration you&apos;ve made?</p>
      <p className='modal-subtitle'>Once you start over, you&apos;ll lose all progress you&apos;ve made in your configuration.</p>
      <div className='modal-actions'>
        <button className='modal-confirm-btn' onClick={onConfirm}>Yes, Start Over</button>
        <button className='modal-cancel-btn' onClick={onCancel}>No, Continue with the Current Build</button>
      </div>
    </div>
  </div>
)

export default ClearConfirmModal
