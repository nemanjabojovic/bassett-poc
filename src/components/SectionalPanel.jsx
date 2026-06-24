import { useState } from 'react'
import data from './JolaPlayer/data.json'
import armSelectionImg from '../assets/icons/arm_selection.png'

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

const ChevronIcon = ({ open }) => (
  <svg
    width='16' height='16' viewBox='0 0 16 16' fill='none'
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
  >
    <path d='M3 6l5 5 5-5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
)

const SectionHeader = ({ label, selectedName, selectedIcon, open, onClick }) => (
  <button className='config-section-header' onClick={onClick}>
    <span className='config-section-label'>{label}</span>
    <div className='config-section-header-meta'>
      {selectedIcon && (
        <img src={selectedIcon} alt='' className='config-section-header-icon' />
      )}
      {selectedName && (
        <span className='config-section-selected-text'>{selectedName}</span>
      )}
      <ChevronIcon open={open} />
    </div>
  </button>
)

const SectionalPanel = ({ sku, frame, onClose }) => {
  const [layoutOpen, setLayoutOpen] = useState(true)
  const [armOpen, setArmOpen] = useState(false)
  const [tallBackOpen, setTallBackOpen] = useState(false)
  const [coverOpen, setCoverOpen] = useState(false)
  const [cushionOpen, setCushionOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [selectedLayout, setSelectedLayout] = useState(null)
  const [selectedArm, setSelectedArm] = useState(null)
  const [tallBack, setTallBack] = useState(null)

  const frameName = frame?.name || sku || ''

  const popularConfigs = data.popularConfigurations.filter(
    pc => pc.collection === 'bassett'
  )

  const armTypes = data.collectionOptions?.armTypes?.filter(
    a => a.collection === 'bassett'
  ) || []

  const defaultArm = armTypes[0]
  const activeArm = armTypes.find(a => a.name === selectedArm) || defaultArm

  return (
    <aside className='config-panel'>
      {showConfirm && (
        <CloseConfirmModal
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
          <SectionHeader
            label='Select a Layout'
            selectedName={selectedLayout?.name || null}
            open={layoutOpen}
            onClick={() => setLayoutOpen(v => !v)}
          />
          {layoutOpen && (
            <div className='config-section-content'>
              <div className='config-layout-grid'>
                <div className='config-layout-new'>
                  <div className='config-layout-new-icon'>+</div>
                  <p>Start a New Build</p>
                </div>
                {popularConfigs.map((pc, i) => (
                  <div
                    key={i}
                    className={`config-layout-item${selectedLayout?.name === pc.name ? ' config-layout-item--selected' : ''}`}
                    onClick={() => setSelectedLayout(pc)}
                  >
                    <div className='config-layout-thumb' />
                    <p>{pc.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='config-section'>
          <SectionHeader
            label='Arm Options'
            selectedName={activeArm?.name?.replace(/_/g, ' ') || null}
            selectedIcon={activeArm ? armSelectionImg : null}
            open={armOpen}
            onClick={() => setArmOpen(v => !v)}
          />
          {armOpen && (
            <div className='config-section-content'>
              <div className='config-arm-grid'>
                {armTypes.map((arm, i) => {
                  const isSelected = selectedArm ? selectedArm === arm.name : i === 0
                  return (
                    <div
                      key={i}
                      className={`config-arm-item${isSelected ? ' config-arm-item--selected' : ''}`}
                      onClick={() => setSelectedArm(arm.name)}
                    >
                      <img src={armSelectionImg} alt={arm.name} />
                      <span>{arm.name.replace(/_/g, ' ')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className='config-section'>
          <SectionHeader
            label='Tall Back'
            selectedName={tallBack || 'Yes'}
            open={tallBackOpen}
            onClick={() => setTallBackOpen(v => !v)}
          />
          {tallBackOpen && (
            <div className='config-section-content'>
              <div className='config-arm-grid'>
                {['Yes', 'No'].map((opt, i) => (
                  <div
                    key={i}
                    className={`config-arm-item${(tallBack || 'Yes') === opt ? ' config-arm-item--selected' : ''}`}
                    onClick={() => setTallBack(opt)}
                  >
                    <span className='config-arm-text-only'>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='config-section'>
          <SectionHeader
            label='Cover Options'
            open={coverOpen}
            onClick={() => setCoverOpen(v => !v)}
          />
          {coverOpen && (
            <div className='config-section-content'>
              <p className='config-empty'>Cover options coming soon</p>
            </div>
          )}
        </div>

        <div className='config-section'>
          <SectionHeader
            label='Cushion Options'
            open={cushionOpen}
            onClick={() => setCushionOpen(v => !v)}
          />
          {cushionOpen && (
            <div className='config-section-content'>
              <p className='config-empty'>Cushion options coming soon</p>
            </div>
          )}
        </div>
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
