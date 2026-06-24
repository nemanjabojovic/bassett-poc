const CloseConfirmModal = ({ onConfirm, onCancel }) => (
  <div className='modal-overlay'>
    <div className='modal'>
      <button className='modal-dismiss' onClick={onCancel}>&#10005;</button>
      <p className='modal-title'>Are you sure you want to close the configurator?</p>
      <p className='modal-subtitle'>We will return you to the previous screen</p>
      <div className='modal-actions'>
        <button className='modal-confirm-btn' onClick={onConfirm}>Yes, Close</button>
        <button className='modal-cancel-btn' onClick={onCancel}>No, Continue Building</button>
      </div>
    </div>
  </div>
)

export default CloseConfirmModal
