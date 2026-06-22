import { useState } from 'react'
import data from './JolaPlayer/data.json'

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

const ChevronIcon = ({ open }) => (
  <svg
    width='16' height='16' viewBox='0 0 16 16' fill='none'
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <path d='M3 6l5 5 5-5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
)

const SectionRow = ({ label, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className='config-section'>
      <button className='config-section-header' onClick={() => setOpen(v => !v)}>
        <span className='config-section-label'>{label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className='config-section-content'>{children}</div>}
    </div>
  )
}

const SectionalPanel = ({ sku, frame, onClose }) => {
  const [layoutOpen, setLayoutOpen] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  const frameName = frame?.name || sku || ''

  const popularConfigs = data.popularConfigurations.filter(
    pc => pc.collection === 'bassett'
  )

  const armTypes = data.collectionOptions?.armTypes?.filter(
    a => a.collection === 'bassett'
  ) || []

  return (
    <aside className='config-panel'>
      {showConfirm && (
        <ClearConfirmModal
          onConfirm={onClose}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <div className='config-panel-header'>
        <div className='config-panel-title-group'>
          <h2 className='config-panel-title'>{frameName}</h2>
          <p className='config-panel-sku'>{sku}</p>
        </div>
        <button className='config-panel-close' onClick={() => setShowConfirm(true)}>&#10005;</button>
      </div>

      <div className='config-panel-body'>
        <div className='config-section'>
          <button
            className='config-section-header'
            onClick={() => setLayoutOpen(v => !v)}
          >
            <span className='config-section-label'>Select a Layout</span>
            <ChevronIcon open={layoutOpen} />
          </button>

          {layoutOpen && (
            <div className='config-section-content'>
              <div className='config-layout-grid'>
                <div className='config-layout-new'>
                  <div className='config-layout-new-icon'>+</div>
                  <p>Start a New Build</p>
                </div>
                {popularConfigs.map((pc, i) => (
                  <div key={i} className='config-layout-item'>
                    <div className='config-layout-thumb' />
                    <p>{pc.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <SectionRow label='Arm Options'>
          <div className='config-option-list'>
            {armTypes.map((arm, i) => (
              <div key={i} className='config-option-item'>{arm.name}</div>
            ))}
          </div>
        </SectionRow>

        <SectionRow label='Tall Back'>
          <div className='config-option-list'>
            <div className='config-option-item'>Yes</div>
            <div className='config-option-item'>No</div>
          </div>
        </SectionRow>

        <SectionRow label='Cover Options'>
          <p className='config-empty'>Cover options coming soon</p>
        </SectionRow>

        <SectionRow label='Cushion Options'>
          <p className='config-empty'>Cushion options coming soon</p>
        </SectionRow>
      </div>

      <div className='config-panel-footer'>
        <div className='config-cta-row'>
          <button className='config-summary-btn'>View Summary</button>
          <button className='config-cart-btn'>Add to Cart</button>
        </div>
      </div>
    </aside>
  )
}

export default SectionalPanel
