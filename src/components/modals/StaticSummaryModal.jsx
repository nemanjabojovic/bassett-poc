import { useState, useEffect } from 'react'

const StaticSummaryModal = ({ sku, frame, dimensions, isTable, selectedCover, selectedTop, selectedBase, onClose }) => {
  const [screenshot, setScreenshot] = useState(null)

  useEffect(() => {
    const dataUrl = window.player?.getScreenshot('default')
    if (dataUrl) setScreenshot(dataUrl)
  }, [])

  return (
    <div className='summary-overlay' onClick={onClose}>
      <div className='summary-modal' onClick={e => e.stopPropagation()}>
        <div className='summary-modal-topbar'>
          <div>
            <p className='summary-modal-title'>Your Design</p>
            <p className='summary-modal-subtitle'>Below you will find the list of all your selections for your build</p>
          </div>
          <div className='summary-modal-actions'>
            <button className='summary-icon-btn' title='Download' onClick={() => window.player?.downloadScreenshot()}>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M8 2v8M5 7l3 3 3-3M2 12h12' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round' strokeLinejoin='round'/></svg>
              <span>Download</span>
            </button>
            <button className='summary-icon-btn' title='Print' onClick={() => window.print()}>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'><rect x='3' y='6' width='10' height='7' rx='1' stroke='currentColor' strokeWidth='1.3'/><path d='M5 6V3h6v3M5 10h6' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round'/></svg>
              <span>Print</span>
            </button>
            <button className='summary-modal-close' onClick={onClose}>&#10005;</button>
          </div>
        </div>

        <div className='summary-modal-body'>
          <div className='summary-main'>
            <div className='summary-preview'>
              {screenshot
                ? <img src={screenshot} alt='Configuration preview' className='summary-preview-img' />
                : <div className='summary-preview-placeholder' />
              }
            </div>
            <div className='summary-details'>
              <p className='summary-frame-name'>{frame?.name || sku}</p>
              <p className='summary-frame-sku'>{sku}</p>
              {dimensions && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Dimensions</p>
                  <p className='summary-section-value'>H{Math.round(dimensions.height)}" W{Math.round(dimensions.width)}" D{Math.round(dimensions.depth)}"</p>
                </div>
              )}
              {!isTable && selectedCover && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Fabric Options</p>
                  <div className='summary-section-swatch'>
                    {selectedCover.icon && (
                      <div className='summary-swatch-thumb' style={{ backgroundImage: `url(${selectedCover.icon})` }} />
                    )}
                    <span className='summary-section-value'>{selectedCover.name || selectedCover.sku}</span>
                  </div>
                </div>
              )}
              {isTable && selectedTop && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Top Finish</p>
                  <div className='summary-section-swatch'>
                    {selectedTop.icon && (
                      <div className='summary-swatch-thumb' style={{ backgroundImage: `url(${selectedTop.icon})` }} />
                    )}
                    <span className='summary-section-value'>{selectedTop.name || selectedTop.sku}</span>
                  </div>
                </div>
              )}
              {isTable && selectedBase && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Base Finish</p>
                  <div className='summary-section-swatch'>
                    {selectedBase.icon && (
                      <div className='summary-swatch-thumb' style={{ backgroundImage: `url(${selectedBase.icon})` }} />
                    )}
                    <span className='summary-section-value'>{selectedBase.name || selectedBase.sku}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='summary-modal-footer'>
          <button className='summary-specs-btn'>Technical Specs</button>
          <button className='summary-save-btn'>Save &amp; Share</button>
        </div>
      </div>
    </div>
  )
}

export default StaticSummaryModal
