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

const StaticFramePanel = ({ sku, frame, onClose }) => {
  const [fabricOpen, setFabricOpen] = useState(true)
  const [cushionOpen, setCushionOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const frameName = frame?.name || sku || ''

  const fabrics = frame?.textures
    ? data.fabrics.filter(f => frame.textures.includes(f.name))
    : data.fabrics

  const filtered = fabrics.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  )

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
            onClick={() => setFabricOpen(v => !v)}
          >
            <span className='config-section-label'>Fabric Options</span>
            <ChevronIcon open={fabricOpen} />
          </button>

          {fabricOpen && (
            <div className='config-section-content'>
              <input
                className='config-search'
                placeholder='Search Fabrics'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className='config-swatch-grid'>
                {filtered.length > 0 ? filtered.map((fabric, i) => (
                  <div key={i} className='config-swatch'>
                    <div
                      className='config-swatch-img'
                      style={{ backgroundImage: fabric.icon ? `url(${fabric.icon})` : 'none' }}
                    />
                    <span className='config-swatch-name'>{fabric.name}</span>
                  </div>
                )) : (
                  <p className='config-empty'>No fabrics found</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='config-section'>
          <button
            className='config-section-header'
            onClick={() => setCushionOpen(v => !v)}
          >
            <span className='config-section-label'>Cushion Options</span>
            <ChevronIcon open={cushionOpen} />
          </button>
          {cushionOpen && (
            <div className='config-section-content'>
              <p className='config-empty'>No cushion options</p>
            </div>
          )}
        </div>
      </div>

      <div className='config-panel-footer'>
        <div className='config-dimensions'>
          <span>Height {frame?.height || '--'}</span>
          <span>Width {frame?.width || '--'}</span>
          <span>Depth {frame?.depth || '--'}</span>
        </div>
        <div className='config-footer-price-row'>
          <button className='config-clear-btn'>Clear Configuration</button>
          <span className='config-price'>$0.00</span>
        </div>
        <div className='config-cta-row'>
          <button className='config-summary-btn'>View Summary</button>
          <button className='config-cart-btn'>Add to Cart</button>
        </div>
      </div>
    </aside>
  )
}

export default StaticFramePanel
