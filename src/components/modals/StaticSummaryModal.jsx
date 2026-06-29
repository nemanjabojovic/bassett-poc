import { useState, useEffect } from 'react'
import downloadIcon from '../../assets/icons/Download.png'
import shareIcon from '../../assets/icons/Share.png'
import printIcon from '../../assets/icons/Print.png'

const StaticSummaryModal = ({ sku, frame, dimensions, isTable, selectedCover, selectedTop, selectedBase, selectedEdge, selectedSize, selectedCushion, selectedArm, onClose }) => {
  const [screenshot, setScreenshot] = useState(null)

  useEffect(() => {
    const dataUrl = window.player?.getScreenshot('default')
    if (dataUrl) setScreenshot(dataUrl)
  }, [])

  return (
    <div className='summary-overlay' onClick={onClose}>
      <div className='summary-modal' onClick={e => e.stopPropagation()}>
        <button className='summary-modal-close' onClick={onClose}>&#10005;</button>
        <div className='summary-modal-topbar'>
          <div>
            <p className='summary-modal-title'>Your Design</p>
            <p className='summary-modal-subtitle'>Below you will find the list of all your selections for your build</p>
          </div>
          <div className='summary-modal-actions'>
            <button className='summary-icon-btn' title='Download'>
              <img src={downloadIcon} alt='Download' className='summary-action-icon' />
              <span>Download</span>
            </button>
            <button className='summary-icon-btn' title='Share'>
              <img src={shareIcon} alt='Share' className='summary-action-icon' />
              <span>Share</span>
            </button>
            <button className='summary-icon-btn' title='Print' onClick={() => window.print()}>
              <img src={printIcon} alt='Print' className='summary-action-icon' />
              <span>Print</span>
            </button>
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
              {!isTable && selectedSize && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Size</p>
                  <p className='summary-section-value'>{selectedSize}</p>
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
              {!isTable && selectedCushion && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Cushion</p>
                  <p className='summary-section-value'>{selectedCushion.name}</p>
                </div>
              )}
              {!isTable && selectedArm && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Arm Style</p>
                  <p className='summary-section-value'>{selectedArm.name.replace(/_/g, ' ')}</p>
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
              {isTable && selectedEdge && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Edge Profile</p>
                  <div className='summary-section-swatch'>
                    {selectedEdge.icon && (
                      <img src={selectedEdge.icon} alt={selectedEdge.name} className='summary-arm-thumb' />
                    )}
                    <span className='summary-section-value'>{selectedEdge.name}</span>
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
