import { useState, useEffect } from 'react'
import data from '../JolaPlayer/data.json'
import armSelectionImg from '../../assets/icons/arm_selection.png'

const ViewSummaryModal = ({ sku, frame, configElementIds, selectedArm, tallBack, dimensions, selectedCover, onClose }) => {
  const [screenshot, setScreenshot] = useState(null)

  useEffect(() => {
    const dataUrl = window.player?.getScreenshot('default')
    if (dataUrl) setScreenshot(dataUrl)
  }, [])

  const grouped = configElementIds.reduce((acc, id) => {
    const f = data.frames.find(fr => fr.id === id)
    if (!f) return acc
    if (!acc[f.id]) acc[f.id] = { frame: f, qty: 0 }
    acc[f.id].qty++
    return acc
  }, {})
  const components = Object.values(grouped)

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
              {configElementIds.length > 0 && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Build</p>
                  <p className='summary-section-value'>Custom Build {configElementIds.length} Component{configElementIds.length !== 1 ? 's' : ''}</p>
                </div>
              )}
              {selectedCover && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Fabric Options</p>
                  <div className='summary-section-swatch'>
                    {selectedCover.icon
                      ? <div className='summary-swatch-thumb' style={{ backgroundImage: `url(${selectedCover.icon})` }} />
                      : <div className='summary-swatch-thumb' />
                    }
                    <span className='summary-section-value'>{selectedCover.name || selectedCover.sku}</span>
                  </div>
                </div>
              )}
              {selectedArm && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Arm Options</p>
                  <div className='summary-section-swatch'>
                    <img src={armSelectionImg} alt='' className='summary-arm-thumb' />
                    <span className='summary-section-value'>{selectedArm.name?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              )}
              {tallBack && (
                <div className='summary-section'>
                  <p className='summary-section-label'>Tall Back</p>
                  <p className='summary-section-value'>{tallBack}</p>
                </div>
              )}
            </div>
          </div>

          {components.length > 0 && (
            <div className='summary-build-overview'>
              <p className='summary-build-overview-title'>Build Overview</p>
              <div className='summary-build-overview-grid'>
                {components.map((item, i) => (
                  <div key={i} className='summary-build-overview-item'>
                    {item.frame.icon
                      ? <img src={item.frame.icon} alt={item.frame.name} className='summary-build-overview-thumb' />
                      : <div className='summary-build-overview-thumb' />
                    }
                    <p className='summary-build-overview-name'>{item.frame.name}</p>
                    <p className='summary-build-overview-detail'>QTY: {item.qty}</p>
                    <p className='summary-build-overview-detail'>SKU: {item.frame.sku}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='summary-modal-footer'>
          <button className='summary-specs-btn'>Technical Specs</button>
          <button className='summary-save-btn'>Save &amp; Share</button>
        </div>
      </div>
    </div>
  )
}

export default ViewSummaryModal
