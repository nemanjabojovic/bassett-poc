import { useState } from 'react'
import data from './JolaPlayer/data.json'
import CloseConfirmModal from './modals/CloseConfirmModal'

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
        <div
          className='config-section-header-swatch'
          style={{ backgroundImage: `url(${selectedIcon})` }}
        />
      )}
      {selectedName && (
        <span className='config-section-selected-text'>{selectedName}</span>
      )}
      <ChevronIcon open={open} />
    </div>
  </button>
)

const SwatchSection = ({ label, items, defaultOpen, onSelect, materialName }) => {
  const [open, setOpen] = useState(defaultOpen || false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(items[0] || null)

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
                onClick={() => {
                  setSelected(item)
                  if (onSelect) onSelect(item, materialName)
                }}
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

const FabricBody = ({ frame }) => {
  const frameOptions = resolveTextures(frame?.textures)

  return (
    <>
      <SwatchSection
        label='Fabric Options'
        items={frameOptions}
        defaultOpen={true}
        onSelect={handleTextureSelect}
        materialName='main'
      />
      <DropdownSection label='Cushion Options' options={[]} />
    </>
  )
}

const TableBody = ({ frame }) => {
  const finishes = resolveTextures(frame?.textures)

  return (
    <>
      <SwatchSection label='Top Finish' items={finishes} defaultOpen={true} onSelect={handleTextureSelect} materialName='Top' />
      <SwatchSection label='Base Finish' items={finishes} onSelect={handleTextureSelect} materialName='Base' />
      <DropdownSection label='Edge Profiles' options={['Classic', 'Eased', 'Bevel']} />
    </>
  )
}

const StaticFramePanel = ({ sku, frame, onClose }) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const isTable = frame?.type === 'table'
  const frameName = frame?.name || sku || ''

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
        {isTable ? <TableBody frame={frame} /> : <FabricBody frame={frame} />}
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

export default StaticFramePanel
