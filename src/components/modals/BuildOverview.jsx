import data from '../JolaPlayer/data.json'

const BuildOverview = ({ configElementIds, onClose }) => {
  const grouped = configElementIds.reduce((acc, id) => {
    const f = data.frames.find(fr => fr.id === id)
    if (!f) return acc
    const key = f.id
    if (!acc[key]) acc[key] = { frame: f, qty: 0 }
    acc[key].qty++
    return acc
  }, {})
  const items = Object.values(grouped)

  return (
    <div className='build-overview-overlay' onClick={onClose}>
      <div className='build-overview' onClick={e => e.stopPropagation()}>
        <div className='build-overview-header'>
          <div>
            <p className='build-overview-title'>Build Overview</p>
            <p className='build-overview-count'>{configElementIds.length} Component{configElementIds.length !== 1 ? 's' : ''}</p>
          </div>
          <button className='build-overview-close' onClick={onClose}>&#10005;</button>
        </div>
        <div className='build-overview-list'>
          {items.map((item, i) => (
            <div key={i} className='build-overview-item'>
              {item.frame.icon
                ? <img src={item.frame.icon} alt={item.frame.name} className='build-overview-thumb' />
                : <div className='build-overview-thumb' />
              }
              <div className='build-overview-info'>
                <p className='build-overview-name'>{item.frame.name}</p>
                <p className='build-overview-detail'>QTY: {item.qty}</p>
                <p className='build-overview-detail'>SKU: {item.frame.sku}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BuildOverview
