import { useState, useEffect } from 'react'
import data from './JolaPlayer/data.json'
import armSelectionImg from '../assets/icons/arm_selection.png'

const allTextures = [
  ...(data.fabrics || []),
  ...(data.leathers || []),
  ...(data.woods || [])
]

const resolveTextures = (skus) =>
  skus ? allTextures.filter(t => skus.includes(t.sku)) : allTextures

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
  const [buildMode, setBuildMode] = useState('popular')
  const [configElementIds, setConfigElementIds] = useState([])

  const frameName = frame?.name || sku || ''

  const popularConfigs = data.popularConfigurations.filter(pc => {
    if (pc.collection !== 'bassett') return false
    return pc.elements.every(el => {
      const f = data.frames.find(fr => fr.id === el.id)
      return f && !f.staticFrame && f.type !== 'table'
    })
  })

  const byoFrames = data.frames.filter(
    f => f.collection === 'bassett' && !f.staticFrame && f.type !== 'table'
  )

  const armTypes = data.collectionOptions?.armTypes?.filter(
    a => a.collection === 'bassett'
  ) || []

  const defaultArm = armTypes[0]
  const activeArm = armTypes.find(a => a.name === selectedArm) || defaultArm

  const configTextures = (() => {
    const skus = new Set()
    configElementIds.forEach(id => {
      const f = data.frames.find(fr => fr.id === id)
      if (f?.textures) f.textures.forEach(s => skus.add(s))
    })
    return resolveTextures(skus.size > 0 ? [...skus] : null)
  })()

  useEffect(() => {
    if (popularConfigs.length === 0) return
    const first = popularConfigs[0]
    setSelectedLayout(first)
    setConfigElementIds(first.elements.map(e => e.id))

    const load = () => window.player?.setConfiguration(first)

    if (window.player) {
      load()
    } else {
      const handler = () => load()
      window.addEventListener('playerReady', handler, { once: true })
      return () => window.removeEventListener('playerReady', handler)
    }
  }, [])

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
              {buildMode === 'popular' ? (
                <div className='config-layout-grid'>
                  <div
                    className='config-layout-new'
                    onClick={() => {
                      setSelectedLayout(null)
                      setConfigElementIds([])
                      setBuildMode('byo')
                      window.player?.clearConfiguration()
                    }}
                  >
                    <div className='config-layout-new-icon'>
                      <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
                        <circle cx='16' cy='16' r='15' stroke='#333' strokeWidth='1.2' />
                        <path d='M16 10v12M10 16h12' stroke='#333' strokeWidth='1.2' strokeLinecap='round' />
                      </svg>
                    </div>
                    <p>Start a<br />New Build</p>
                  </div>
                  {popularConfigs.map((pc, i) => (
                    <div
                      key={i}
                      className={`config-layout-item${selectedLayout?.name === pc.name ? ' config-layout-item--selected' : ''}`}
                      onClick={() => {
                        setSelectedLayout(pc)
                        setConfigElementIds(pc.elements.map(e => e.id))
                        window.player?.setConfiguration(pc)
                      }}
                    >
                      {pc.icon
                        ? <img src={pc.icon} alt={pc.name} className='config-layout-thumb' />
                        : <div className='config-layout-thumb' />
                      }
                      <p>{pc.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='config-byo'>
                  <button
                    className='config-byo-back'
                    onClick={() => {
                      setBuildMode('popular')
                      if (selectedLayout) {
                        setConfigElementIds(selectedLayout.elements.map(e => e.id))
                        window.player?.setConfiguration(selectedLayout)
                      }
                    }}
                  >
                    Back to Popular Builds
                  </button>
                  <div className='config-layout-grid'>
                    {byoFrames.map((f, i) => (
                      <div
                        key={i}
                        className='config-layout-item'
                        onClick={() => {
                          setConfigElementIds(prev => [...prev, f.id])
                          window.player?.addConfiguration({ id: f.id })
                        }}
                      >
                        {f.icon
                          ? <img src={f.icon} alt={f.name} className='config-layout-thumb' />
                          : <div className='config-layout-thumb' />
                        }
                        <p>{f.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                      onClick={() => {
                        setSelectedArm(arm.name)
                        window.player?.setArmType(arm)
                      }}
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
                    onClick={() => {
                      setTallBack(opt)
                      window.player?.setBackType({ name: opt === 'Yes' ? 'TallBack' : 'StandardBack' })
                    }}
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
              <div className='config-swatch-grid'>
                {configTextures.map((item, i) => (
                  <div
                    key={i}
                    className='config-swatch'
                    onClick={() => window.player?.loadFabric(item, 'main', true)}
                  >
                    <div
                      className='config-swatch-img'
                      style={{ backgroundImage: item.icon ? `url(${item.icon})` : 'none' }}
                    />
                    <span className='config-swatch-name'>
                      <span className='config-swatch-sku'>{item.sku}</span>
                      {item.name && <span className='config-swatch-label'>{item.name}</span>}
                    </span>
                  </div>
                ))}
              </div>
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
