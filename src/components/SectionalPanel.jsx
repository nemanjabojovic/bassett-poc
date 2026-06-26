import { useState, useEffect } from 'react'
import CloseIcon from '../assets/icons/Close.png'
import startNewBuildImg from '../assets/icons/Start new build.png'
import jolaLogoSvg from '../assets/icons/jolaLogo.svg'
import data from './JolaPlayer/data.json'
import armSelectionImg from '../assets/icons/arm_selection.png'
import loungeImg from '../assets/images/Lounge.png'
import supportImg from '../assets/images/Support.png'
import premierImg from '../assets/images/Premier.png'
import CloseConfirmModal from './modals/CloseConfirmModal'
import ClearConfirmModal from './modals/ClearConfirmModal'
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
    </div>
    <ChevronIcon open={open} />
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
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [swapMode, setSwapMode] = useState(false)
  const [swapState, setSwapState] = useState(null)

  const [selectedLayout, setSelectedLayout] = useState(null)
  const [selectedArm, setSelectedArm] = useState(null)
  const [tallBack, setTallBack] = useState(null)
  const [buildMode, setBuildMode] = useState('popular')
  const [configElementIds, setConfigElementIds] = useState([])
  const [showBuildOverview, setShowBuildOverview] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [selectedCover, setSelectedCover] = useState(data.fabrics?.[0] || null)
  const [materialType, setMaterialType] = useState(null)

  const frameName = frame?.name || sku || ''

  const popularConfigs = data.popularConfigurations.filter(popularConfig => {
    if (popularConfig.collection !== 'bassett') return false
    return popularConfig.elements.every(element => {
      const frame = data.frames.find(frame => frame.id === element.id)
      return frame && !frame.staticFrame && frame.type !== 'table'
    })
  })

  const byoFrames = data.frames.filter(
    frame => frame.collection === 'bassett' && !frame.staticFrame && frame.type !== 'table'
  )

  const armTypes = data.collectionOptions?.armTypes?.filter(
    armType => armType.collection === 'bassett'
  ) || []

  const defaultArm = armTypes[0]
  const activeArm = armTypes.find(armType => armType.name === selectedArm) || defaultArm

  const displayTitle = (() => {
    const armDisplay = activeArm?.name.replace(/_/g, ' ')
    if (!frameName || !armDisplay) return frameName
    const stripped = frameName
      .replace(/^(Left|Right) Arm\s+/, '')
      .replace(/\s+(L|R|Corner)\s+Sectional$/, '')
      .replace(/\s+Sectional$/, '')
    return `${stripped} ${armDisplay} Reclining Sectional`
  })()

  const getFrameTextureSKUs = (frame) => {
    if (!frame?.textures) return []
    return Array.isArray(frame.textures)
      ? frame.textures
      : Object.values(frame.textures).flat()
  }

  const configTextures = (() => {
    // flatMap because each frame returns an array of SKUs — flattens [["a","b"],["c"]] into ["a","b","c"]
    const skus = configElementIds.flatMap(id => {
      const f = data.frames.find(fr => fr.id === id)
      return getFrameTextureSKUs(f)
    })
    return resolveTextures(skus.length > 0 ? skus : null)
  })()

  const materialTypes = data.materialTypes || []
  const activeMaterialType = materialType || materialTypes[0]?.name || null
  const displayTextures = activeMaterialType
    ? configTextures.filter(t => t.type === activeMaterialType)
    : configTextures

  useEffect(() => {
    if (popularConfigs.length === 0) return
    const first = popularConfigs[0]
    setSelectedLayout(first)
    const ids = first.elements.map(e => e.id)
    setConfigElementIds(ids)
    const allSkus = ids.flatMap(id => {
      const f = data.frames.find(fr => fr.id === id)
      return getFrameTextureSKUs(f)
    })
    const textures = resolveTextures(allSkus.length > 0 ? allSkus : null)
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

  useEffect(() => {
    const onSwapInitiated = () => {
      const state = window.player?.getSwapState()
      setSwapState(state)
      setSwapMode(true)
      setBuildMode('byo')
      setLayoutOpen(true)
    }
    const onSwapCompleted = () => {
      setSwapMode(false)
      setSwapState(null)
    }
    window.addEventListener('swapInitiated', onSwapInitiated)
    window.addEventListener('swapCompleted', onSwapCompleted)
    return () => {
      window.removeEventListener('swapInitiated', onSwapInitiated)
      window.removeEventListener('swapCompleted', onSwapCompleted)
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
      {showBackConfirm && (
        <ClearConfirmModal
          onConfirm={async () => {
            const first = popularConfigs[0]
            setSelectedLayout(first)
            setBuildMode('popular')
            await window.player?.clearConfiguration()
            if (first) window.player?.setConfiguration(first)
            setShowBackConfirm(false)
          }}
          onCancel={() => setShowBackConfirm(false)}
        />
      )}
      {showBuildOverview && (
        <BuildOverview
          configElementIds={configElementIds}
          materialType={activeMaterialType}
          onClose={() => setShowBuildOverview(false)}
        />
      )}
      <div className='config-panel-header'>
        <div className='config-panel-title-group'>
          <h2 className='config-panel-title'>{displayTitle}</h2>
          <p className='config-panel-sku'>
            {configElementIds.length > 0
              ? configElementIds.map(id => {
                  const f = data.frames.find(fr => fr.id === id)
                  return f?.variants?.[activeMaterialType] || id
                }).join(' & ')
              : sku}
          </p>
        </div>
        <button className='config-panel-close' onClick={() => setShowConfirm(true)}><img src={CloseIcon} alt='Close' /></button>
      </div>

      <div className='config-panel-body'>
        <div className='config-section'>
          <SectionHeader
            label={buildMode === 'byo' ? 'Pick a Component' : 'Select a Layout'}
            selectedName={buildMode === 'popular' && selectedLayout
              ? selectedLayout.elements.map(e => {
                  const f = data.frames.find(fr => fr.id === e.id)
                  return f?.variants?.[activeMaterialType] || e.id
                }).join(' & ')
              : null}
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
                    <img src={startNewBuildImg} alt='Start a New Build' className='config-layout-thumb' />
                    <p>&nbsp;</p>
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
                          : <img src={jolaLogoSvg} alt='' className='config-layout-thumb config-layout-thumb--fallback' />
                        }
                        <p>
                        {pc.elements.map(e => {
                          const f = data.frames.find(fr => fr.id === e.id)
                          return f?.variants?.[activeMaterialType] || e.id
                        }).join(' & ')}
                      </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='config-byo'>
                  {swapMode ? (
                    <div className='config-swap-banner'>
                      <span>Select a component to swap</span>
                      <button
                        className='config-swap-cancel'
                        onClick={() => {
                          window.player?.cancelSwap()
                          setSwapMode(false)
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className='config-byo-back'
                      onClick={() => setShowBackConfirm(true)}
                    >
                      Back to Popular Builds
                    </button>
                  )}
                  <div className='config-layout-grid'>
                    {(swapMode && swapState
                      ? byoFrames.filter(f => {
                          const leftOk = !swapState.leftModel || swapState.leftModel.pairing?.right?.includes(f.id)
                          const rightOk = !swapState.rightModel || swapState.rightModel.pairing?.left?.includes(f.id)
                          return leftOk && rightOk
                        })
                      : byoFrames
                    ).map((f, i) => (
                      <div
                        key={i}
                        className={`config-layout-item${swapMode ? ' config-layout-item--swap' : ' config-layout-item--draggable'}`}
                        onClick={swapMode ? () => window.player?.setSwapElement({ id: f.id }) : undefined}
                        onMouseDown={swapMode ? undefined : (e) => {
                          e.preventDefault()
                          const startX = e.clientX
                          const startY = e.clientY
                          let dragging = false

                          const onMove = (moveEvent) => {
                            //20px threshold to start dragging
                            const dx = moveEvent.clientX - startX
                            const dy = moveEvent.clientY - startY
                            if (!dragging && Math.sqrt(dx * dx + dy * dy) > 20) {
                              dragging = true
                              window.player?.onDragStart(f.id)
                            }
                          }

                          const onUp = () => {
                            if (dragging) window.player?.onDragEnd()
                            document.removeEventListener('mousemove', onMove)
                            document.removeEventListener('mouseup', onUp)
                          }

                          document.addEventListener('mousemove', onMove)
                          document.addEventListener('mouseup', onUp)
                        }}
                      >
                        {f.icon
                          ? <img src={f.icon} alt={f.name} className='config-layout-thumb' />
                          : <img src={jolaLogoSvg} alt='' className='config-layout-thumb config-layout-thumb--fallback' />
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
              {materialTypes.length > 0 && (
                <div className='config-material-toggle'>
                  {materialTypes.map(materialType => (
                    <button
                      key={materialType.name}
                      className={`config-material-btn${activeMaterialType === materialType.name ? ' config-material-btn--active' : ''}`}
                      onClick={() => {
                        setMaterialType(materialType.name)
                        const first = configTextures.find(t => t.type === materialType.name)
                        if (first) {
                          setSelectedCover(first)
                          window.player?.setMaterialType(materialType.name)
                          window.player?.loadFabric(first, 'main', true)
                        }
                      }}
                    >
                      {materialType.name}
                    </button>
                  ))}
                </div>
              )}
              <div className='config-swatch-grid'>
                {displayTextures.map((item, i) => (
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
