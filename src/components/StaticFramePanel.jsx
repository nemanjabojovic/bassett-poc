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

const SwatchSection = ({ label, items, search, onSearch, searchPlaceholder }) => {
  const [open, setOpen] = useState(true)
  const filtered = items.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.sku.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className='config-section'>
      <button className='config-section-header' onClick={() => setOpen(v => !v)}>
        <span className='config-section-label'>{label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className='config-section-content'>
          <input
            className='config-search'
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
          <div className='config-swatch-grid'>
            {filtered.length > 0 ? filtered.map((item, i) => (
              <div key={i} className='config-swatch'>
                <div
                  className='config-swatch-img'
                  style={{ backgroundImage: item.icon ? `url(${item.icon})` : 'none' }}
                />
                <span className='config-swatch-name'>{item.name}</span>
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

const DropdownSection = ({ label, options }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className='config-section'>
      <button className='config-section-header' onClick={() => setOpen(v => !v)}>
        <span className='config-section-label'>{label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className='config-section-content'>
          {options.length > 0 ? (
            <div className='config-option-list'>
              {options.map((opt, i) => (
                <div key={i} className='config-option-item'>{opt}</div>
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

const FabricBody = ({ frame }) => {
  const [search, setSearch] = useState('')
  const allOptions = [...(data.fabrics || []), ...(data.leathers || [])]
  const frameOptions = frame?.textures
    ? allOptions.filter(f => frame.textures.includes(f.sku))
    : allOptions

  return (
    <>
      <SwatchSection
        label='Fabric Options'
        items={frameOptions}
        search={search}
        onSearch={setSearch}
        searchPlaceholder='Search Fabrics'
      />
      <DropdownSection label='Cushion Options' options={[]} />
    </>
  )
}

const TableBody = ({ frame }) => {
  const [topSearch, setTopSearch] = useState('')
  const [baseSearch, setBaseSearch] = useState('')
  const finishes = (frame?.textures || []).map(t => ({ sku: t, name: t, icon: null }))

  return (
    <>
      <SwatchSection
        label='Top Finish'
        items={finishes}
        search={topSearch}
        onSearch={setTopSearch}
        searchPlaceholder='Search Finishes'
      />
      <SwatchSection
        label='Base Finish'
        items={finishes}
        search={baseSearch}
        onSearch={setBaseSearch}
        searchPlaceholder='Search Finishes'
      />
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
