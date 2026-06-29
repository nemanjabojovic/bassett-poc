import { useState, useEffect } from 'react'
import CloseIcon from '../assets/icons/Close.png'
import data from './JolaPlayer/data.json'
import CloseConfirmModal from './modals/CloseConfirmModal'
import StaticSummaryModal from './modals/StaticSummaryModal'
import loungeImg from '../assets/images/Lounge.png'
import supportImg from '../assets/images/Support.png'
import premierImg from '../assets/images/Premier.png'
import classicImg from '../assets/images/Classic.png'
import contemporaryImg from '../assets/images/Contemporary.png'
import transitionalImg from '../assets/images/Transitional.png'
import armSelectionImg from '../assets/icons/arm_selection.png'

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

const SectionHeader = ({ label, selectedName, selectedIcon, open, onClick }) => (
  <button className='config-section-header' onClick={onClick}>
    <span className='config-section-label'>{label}</span>
    <div className='config-section-header-meta'>
      {selectedIcon && (
        <div
          className='config-section-header-swatch'
          style={{ backgroundImage: `url(${selectedIcon})` }}
        />
      )}
      {selectedName && (
        <span className='config-section-selected-text'>{selectedName}</span>
      )}
    </div>
    <ChevronIcon open={open} />
  </button>
)

const SwatchSection = ({ label, items, defaultOpen, onSelect, materialName, value, onChange }) => {
  const [open, setOpen] = useState(defaultOpen || false)
  const [search, setSearch] = useState('')
  const [internalSelected, setInternalSelected] = useState(items[0] || null)

  const selected = value !== undefined ? value : internalSelected

  const handleSelect = (item) => {
    if (onChange) {
      onChange(item)
    } else {
      setInternalSelected(item)
    }
    if (onSelect) onSelect(item, materialName)
  }

  const filtered = items.filter(f =>
    !search || f.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='config-section'>
      <SectionHeader
        label={label}
        selectedName={selected?.name || selected?.sku || null}
        selectedIcon={selected?.icon || null}
        open={open}
        onClick={() => setOpen(v => !v)}
      />
      {open && (
        <div className='config-section-content'>
          <div className='config-search-wrapper'>
            <svg width='14' height='14' viewBox='0 0 16 16' fill='none' className='config-search-icon'>
              <circle cx='7' cy='7' r='5.5' stroke='#71757b' strokeWidth='1.5' />
              <path d='M11 11l3 3' stroke='#71757b' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
            <input
              className='config-search'
              placeholder={`Search ${label}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className='config-swatch-grid'>
            {filtered.length > 0 ? filtered.map((item, i) => (
              <div
                key={i}
                className={`config-swatch${selected?.sku === item.sku ? ' config-swatch--selected' : ''}`}
                onClick={() => handleSelect(item)}
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
            )) : (
              <p className='config-empty'>No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const DropdownSection = ({ label, options, icons }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(options[0] || null)

  return (
    <div className='config-section'>
      <SectionHeader
        label={label}
        selectedName={selected}
        selectedIcon={icons?.[selected] || null}
        open={open}
        onClick={() => setOpen(v => !v)}
      />
      {open && (
        <div className='config-section-content'>
          {options.length > 0 ? (
            <div className='config-option-list'>
              {options.map((opt, i) => (
                <div
                  key={i}
                  className={`config-option-item${selected === opt ? ' config-option-item--selected' : ''}`}
                  onClick={() => setSelected(opt)}
                >
                  {opt}
                </div>
              ))}
            </div>
          ) : (
            <p className='config-empty'>No options</p>
          )}
        </div>
      )}
    </div>
  )
}

const allTextures = [
  ...(data.fabrics || []),
  ...(data.leathers || []),
  ...(data.woods || [])
]

const resolveTextures = (skus) =>
  skus ? allTextures.filter(t => skus.includes(t.sku)) : allTextures

const handleTextureSelect = (item, materialName) => {
  window.player?.loadFabric(item, materialName, true)
}

const SIZE_OPTIONS = ['Twin', 'Full', 'Queen', 'King']

const CUSHION_OPTIONS = [
  { name: 'Lounge', icon: loungeImg },
  { name: 'Support', icon: supportImg },
  { name: 'Premier', icon: premierImg },
]


const EDGE_OPTIONS = [
  { name: 'Classic', sku: 'Classic', icon: classicImg },
  { name: 'Contemporary', sku: 'Contemporary', icon: contemporaryImg },
  { name: 'Transitional', sku: 'Transitional', icon: transitionalImg },
]

const FabricBody = ({ frame, selectedCover, onCoverChange, selectedSize, onSizeChange, selectedCushion, onCushionChange, armOptions, selectedArm, onArmChange }) => {
  const [sizeOpen, setSizeOpen] = useState(false)
  const [cushionOpen, setCushionOpen] = useState(false)
  const [armOpen, setArmOpen] = useState(false)
  const frameOptions = resolveTextures(frame?.textures)

  return (
    <>
      <div className='config-section'>
        <SectionHeader
          label='Select Size'
          selectedName={selectedSize || null}
          open={sizeOpen}
          onClick={() => setSizeOpen(v => !v)}
        />
        {sizeOpen && (
          <div className='config-section-content'>
            <div className='config-size-grid'>
              {SIZE_OPTIONS.map((size, i) => (
                <button
                  key={i}
                  className={`config-size-item${selectedSize === size ? ' config-size-item--selected' : ''}`}
                  onClick={() => onSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <SwatchSection
        label='Fabric Options'
        items={frameOptions}
        defaultOpen={true}
        onSelect={handleTextureSelect}
        materialName='main'
        value={selectedCover}
        onChange={onCoverChange}
      />
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
              {CUSHION_OPTIONS.map((opt, i) => (
                <div
                  key={i}
                  className={`config-option-item${selectedCushion?.name === opt.name ? ' config-option-item--selected' : ''}`}
                  onClick={() => onCushionChange(opt)}
                >
                  <img src={opt.icon} alt={opt.name} />
                  <span>{opt.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {armOptions.length > 0 && (
        <div className='config-section'>
          <SectionHeader
            label='Arm Options'
            selectedName={selectedArm?.name?.replace(/_/g, ' ') || null}
            selectedIcon={selectedArm ? armSelectionImg : null}
            open={armOpen}
            onClick={() => setArmOpen(v => !v)}
          />
          {armOpen && (
            <div className='config-section-content'>
              <div className='config-option-grid'>
                {armOptions.map((arm, i) => (
                  <div
                    key={i}
                    className={`config-option-item${selectedArm?.name === arm.name ? ' config-option-item--selected' : ''}`}
                    onClick={() => {
                      onArmChange(arm)
                      window.player?.setArmType(arm)
                    }}
                  >
                    <img src={armSelectionImg} alt={arm.name} />
                    <span>{arm.name.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

const TableBody = ({ frame, selectedTop, onTopChange, selectedBase, onBaseChange, selectedEdge, onEdgeChange }) => {
  const [edgeOpen, setEdgeOpen] = useState(false)
  const topFinishes = resolveTextures(frame?.topTextures || frame?.textures)
  const baseFinishes = resolveTextures(frame?.baseTextures || frame?.textures)

  return (
    <>
      <SwatchSection label='Top Finish' items={topFinishes} defaultOpen={true} onSelect={handleTextureSelect} materialName='Top' value={selectedTop} onChange={onTopChange} />
      <SwatchSection label='Base Finish' items={baseFinishes} onSelect={handleTextureSelect} materialName='Base' value={selectedBase} onChange={onBaseChange} />
      <div className='config-section'>
        <SectionHeader
          label='Edge Profiles'
          selectedName={selectedEdge?.name || null}
          selectedIcon={selectedEdge?.icon || null}
          open={edgeOpen}
          onClick={() => setEdgeOpen(v => !v)}
        />
        {edgeOpen && (
          <div className='config-section-content'>
            <div className='config-option-grid'>
              {EDGE_OPTIONS.map((opt, i) => (
                <div
                  key={i}
                  className={`config-option-item${selectedEdge?.name === opt.name ? ' config-option-item--selected' : ''}`}
                  onClick={() => onEdgeChange(opt)}
                >
                  <img src={opt.icon} alt={opt.name} />
                  <span>{opt.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const StaticFramePanel = ({ sku, frame, onClose, dimensions }) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const isTable = frame?.type === 'table'
  const frameName = frame?.name || sku || ''

  const initialTextures = resolveTextures(frame?.textures)
  const [selectedCover, setSelectedCover] = useState(initialTextures[0] || null)
  const [selectedTop, setSelectedTop] = useState(initialTextures[0] || null)
  const [selectedBase, setSelectedBase] = useState(initialTextures[0] || null)
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[0])
  const [selectedCushion, setSelectedCushion] = useState(CUSHION_OPTIONS[0])
  const [selectedEdge, setSelectedEdge] = useState(EDGE_OPTIONS[0])
  const armOptions = frame?.arms || []
  const [selectedArm, setSelectedArm] = useState(armOptions[0] || null)

  useEffect(() => {
    if (isTable) window.player?.setEdgeType(EDGE_OPTIONS[0])
  }, [isTable])

  const handleEdgeChange = (opt) => {
    setSelectedEdge(opt)
    window.player?.setEdgeType(opt)
  }

  useEffect(() => {
    const textures = resolveTextures(frame?.textures)
    if (textures[0]) {
      setSelectedCover(textures[0])
      setSelectedTop(textures[0])
      setSelectedBase(textures[0])
    }
    const arms = frame?.arms || []
    setSelectedArm(arms[0] || null)
  }, [frame])

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
        <button className='config-panel-close' onClick={() => setShowConfirm(true)}><img src={CloseIcon} alt='Close' /></button>
      </div>

      <div className='config-panel-body'>
        {isTable
          ? <TableBody frame={frame} selectedTop={selectedTop} onTopChange={setSelectedTop} selectedBase={selectedBase} onBaseChange={setSelectedBase} selectedEdge={selectedEdge} onEdgeChange={handleEdgeChange} />
          : <FabricBody frame={frame} selectedCover={selectedCover} onCoverChange={setSelectedCover} selectedSize={selectedSize} onSizeChange={setSelectedSize} selectedCushion={selectedCushion} onCushionChange={setSelectedCushion} armOptions={armOptions} selectedArm={selectedArm} onArmChange={setSelectedArm} />
        }      </div>

      <div className='config-panel-footer'>
        <div className='config-cta-row'>
          <button className='config-summary-btn' onClick={() => setShowSummary(true)}>View Summary</button>
          <button className='config-cart-btn'>Add to Cart</button>
        </div>
      </div>

      {showSummary && (
        <StaticSummaryModal
          sku={sku}
          frame={frame}
          dimensions={dimensions}
          isTable={isTable}
          selectedCover={isTable ? null : selectedCover}
          selectedTop={isTable ? selectedTop : null}
          selectedBase={isTable ? selectedBase : null}
          selectedEdge={isTable ? selectedEdge : null}
          selectedSize={isTable ? null : selectedSize}
          selectedCushion={isTable ? null : selectedCushion}
          selectedArm={isTable ? null : selectedArm}
          onClose={() => setShowSummary(false)}
        />
      )}
    </aside>
  )
}

export default StaticFramePanel
