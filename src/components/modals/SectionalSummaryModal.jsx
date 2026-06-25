import { useState, useEffect } from 'react'
import data from '../JolaPlayer/data.json'
import armSelectionImg from '../../assets/icons/arm_selection.png'
import jolaLogoSvg from '../../assets/icons/jolaLogo.svg'
import downloadIcon from '../../assets/icons/Download.png'
import shareIcon from '../../assets/icons/Share.png'
import printIcon from '../../assets/icons/Print.png'

const SectionalSummaryModal = ({ sku, frame, configElementIds, selectedArm, tallBack, dimensions, selectedCover, onClose }) => {
  const [screenshot, setScreenshot] = useState(null)

  useEffect(() => {
    const dataUrl = window.player?.getScreenshot('default')
    if (dataUrl) setScreenshot(dataUrl)
  }, [])

  const frameName = frame?.name || sku || ''
  const armDisplay = selectedArm?.name?.replace(/_/g, ' ')
  const displayTitle = (() => {
    if (!frameName || !armDisplay) return frameName
    const stripped = frameName
      .replace(/^(Left|Right) Arm\s+/, '')
      .replace(/\s+(L|R|Corner)\s+Sectional$/, '')
      .replace(/\s+Sectional$/, '')
    return `${stripped} ${armDisplay} Reclining Sectional`
  })()

  const frameIdSubtitle = configElementIds.length > 0
    ? configElementIds.join(' & ')
    : sku

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
              <p className='summary-frame-name'>{displayTitle}</p>
              <p className='summary-frame-sku'>{frameIdSubtitle}</p>
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
                      : <img src={jolaLogoSvg} alt='' className='summary-build-overview-thumb build-overview-thumb--fallback' />
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

export default SectionalSummaryModal
