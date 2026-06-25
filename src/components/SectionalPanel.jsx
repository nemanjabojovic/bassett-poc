import { useState, useEffect } from 'react'
import CloseIcon from '../assets/icons/Close.png'
import data from './JolaPlayer/data.json'
import armSelectionImg from '../assets/icons/arm_selection.png'
import loungeImg from '../assets/images/Lounge.png'
import supportImg from '../assets/images/Support.png'
import premierImg from '../assets/images/Premier.png'
import CloseConfirmModal from './modals/CloseConfirmModal'
import BuildOverview from './modals/BuildOverview'
import SectionalSummaryModal from './modals/SectionalSummaryModal'

const allTextures = [
  ...(data.fabrics || []),
  ...(data.leathers || []),
  ...(data.woods || [])
]

const resolveTextures = (skus) =>
  skus ? allTextures.filter(t => skus.includes(t.sku)) : allTextures

const ChevronIcon = ({ open }) => (
  <span style={{
    display: 'inline-block',
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '6px solid #333',
    flexShrink: 0,
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
  }} />
)

const SectionHeader = ({ label, selectedName, selectedIcon, open, onClick, meta }) => (
  <button className='config-section-header' onClick={onClick}>
    <span className='config-section-label'>{label}</span>
    <div className='config-section-header-meta'>
      {selectedIcon && (
        <img src={selectedIcon} alt='' className='config-section-header-icon' />
      )}
      {selectedName && (
        <span className='config-section-selected-text'>{selectedName}</span>
      )}
      {meta}
      <ChevronIcon open={open} />
    </div>
  </button>
)

const SectionalPanel = ({ sku, frame, onClose, dimensions }) => {
  const [layoutOpen, setLayoutOpen] = useState(true)
  const [armOpen, setArmOpen] = useState(false)
  const [tallBackOpen, setTallBackOpen] = useState(false)
  const [coverOpen, setCoverOpen] = useState(false)
  const [cushionOpen, setCushionOpen] = useState(false)
  const [selectedCushion, setSelectedCushion] = useState({ name: 'Lounge', icon: loungeImg })

  const cushionOptions = [
    { name: 'Lounge', icon: loungeImg },
    { name: 'Support', icon: supportImg },
    { name: 'Premier', icon: premierImg },
  ]
  const [showConfirm, setShowConfirm] = useState(false)

  const [selectedLayout, setSelectedLayout] = useState(null)
  const [selectedArm, setSelectedArm] = useState(null)
  const [tallBack, setTallBack] = useState(null)
  const [buildMode, setBuildMode] = useState('popular')
  const [configElementIds, setConfigElementIds] = useState([])
  const [showBuildOverview, setShowBuildOverview] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [selectedCover, setSelectedCover] = useState(data.fabrics?.[0] || null)

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
    const ids = first.elements.map(e => e.id)
    setConfigElementIds(ids)
    const skus = new Set()
    ids.forEach(id => {
      const f = data.frames.find(fr => fr.id === id)
      if (f?.textures) f.textures.forEach(s => skus.add(s))
    })
    const textures = resolveTextures(skus.size > 0 ? [...skus] : null)
    if (textures[0]) setSelectedCover(textures[0])
  }, [])

  useEffect(() => {
    const handler = () => {
      const elements = window.player?.modelConfiguration?.elements
      if (elements) setConfigElementIds(elements.map(e => e.id))
    }
    window.addEventListener('playerConfigurationChanged', handler)
    return () => window.removeEventListener('playerConfigurationChanged', handler)
  }, [])

  return (
    <aside className='config-panel'>
      {showConfirm && (
        <CloseConfirmModal
          onConfirm={onClose}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showBuildOverview && (
        <BuildOverview
          configElementIds={configElementIds}
          onClose={() => setShowBuildOverview(false)}
        />
      )}
      <div className='config-panel-header'>
        <div className='config-panel-title-group'>
          <h2 className='config-panel-title'>{frameName}</h2>
          <p className='config-panel-sku'>{sku}</p>
        </div>
        <button className='config-panel-close' onClick={() => setShowConfirm(true)}><img src={CloseIcon} alt='Close' /></button>
      </div>

      <div className='config-panel-body'>
        <div className='config-section'>
          <SectionHeader
            label={buildMode === 'byo' ? 'Pick a Component' : 'Select a Layout'}
            selectedName={buildMode === 'popular' ? (selectedLayout?.name || null) : null}
            selectedIcon={buildMode === 'popular' && selectedLayout?.icon ? selectedLayout.icon : null}
            open={layoutOpen}
            onClick={() => setLayoutOpen(v => !v)}
            meta={buildMode === 'byo' ? (
              <span className='config-byo-meta' onClick={e => { e.stopPropagation(); setShowBuildOverview(true) }}>
                <span className='config-byo-count'>{configElementIds.length} Component{configElementIds.length !== 1 ? 's' : ''}</span>
                <span className='config-byo-view'>View Components</span>
              </span>
            ) : null}
          />
          {layoutOpen && (
            <div className='config-section-content'>
              {buildMode === 'popular' ? (
                <div className='config-layout-grid'>
                  <div
                    className='config-layout-new'
                    onClick={() => {
                      setSelectedLayout(null)
                      setBuildMode('byo')
                      window.player?.clearConfiguration()
                      window.player?.setEditSelected(true)
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
                    <div key={i} className='config-layout-item-wrap'>
                      <div
                        className={`config-layout-item${selectedLayout?.name === pc.name ? ' config-layout-item--selected' : ''}`}
                        onClick={() => {
                          setSelectedLayout(pc)
                          window.player?.setConfiguration(pc)
                          window.player?.setEditSelected(false)
                        }}
                      >
                        {pc.icon
                          ? <img src={pc.icon} alt={pc.name} className='config-layout-thumb' />
                          : <div className='config-layout-thumb' />
                        }
                        <p>{pc.name}</p>
                      </div>
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
                        className='config-layout-item config-layout-item--draggable'
                        onMouseDown={(e) => {
                          e.preventDefault()
                          window.player?.onDragStart(f.id)
                          const onUp = () => {
                            window.player?.onDragEnd()
                            document.removeEventListener('mouseup', onUp)
                          }
                          document.addEventListener('mouseup', onUp)
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
              <div className='config-option-grid'>
                {armTypes.map((arm, i) => {
                  const isSelected = selectedArm ? selectedArm === arm.name : i === 0
                  return (
                    <div
                      key={i}
                      className={`config-option-item${isSelected ? ' config-option-item--selected' : ''}`}
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
              <div className='config-toggle-grid'>
                {['Yes', 'No'].map((opt, i) => (
                  <div
                    key={i}
                    className={`config-option-item${(tallBack || 'Yes') === opt ? ' config-option-item--selected' : ''}`}
                    onClick={() => {
                      setTallBack(opt)
                    }}
                  >
                    <span className='config-option-text-only'>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='config-section'>
          <SectionHeader
            label='Cover Options'
            selectedName={selectedCover?.name || selectedCover?.sku || null}
            selectedIcon={selectedCover?.icon || null}
            open={coverOpen}
            onClick={() => setCoverOpen(v => !v)}
          />
          {coverOpen && (
            <div className='config-section-content'>
              <div className='config-swatch-grid'>
                {configTextures.map((item, i) => (
                  <div
                    key={i}
                    className={`config-swatch${selectedCover?.sku === item.sku ? ' config-swatch--selected' : ''}`}
                    onClick={() => {
                      setSelectedCover(item)
                      window.player?.loadFabric(item, 'main', true)
                    }}
                  >
                    <div
                      className='config-swatch-img'
                      style={{ backgroundImage: item.icon ? `url(${item.icon})` : 'none' }}
                    />
                    <span className='config-swatch-sku'>
                      <span>{item.sku}</span>
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
            selectedName={selectedCushion?.name || null}
            selectedIcon={selectedCushion?.icon || null}
            open={cushionOpen}
            onClick={() => setCushionOpen(v => !v)}
          />
          {cushionOpen && (
            <div className='config-section-content'>
              <div className='config-option-grid'>
                {cushionOptions.map((opt, i) => (
                  <div
                    key={i}
                    className={`config-option-item${selectedCushion?.name === opt.name ? ' config-option-item--selected' : ''}`}
                    onClick={() => setSelectedCushion(opt)}
                  >
                    <img src={opt.icon} alt={opt.name} />
                    <span>{opt.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='config-panel-footer'>
        <div className='config-cta-row'>
          <button className='config-summary-btn' onClick={() => setShowSummary(true)}>View Summary</button>
          <button className='config-cart-btn'>Add to Cart</button>
        </div>
      </div>

      {showSummary && (
        <SectionalSummaryModal
          sku={sku}
          frame={frame}
          configElementIds={configElementIds}
          selectedArm={activeArm}
          tallBack={tallBack}
          dimensions={dimensions}
          selectedCover={selectedCover}
          onClose={() => setShowSummary(false)}
        />
      )}
    </aside>
  )
}

export default SectionalPanel
