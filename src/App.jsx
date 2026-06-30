import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Player from "./pages/Player.jsx"
import JolaIcon from "./assets/icons/jolaLogo.svg"
import mainLogo from "./assets/images/main_logo.png"
import swivelImg from "./assets/images/Swivel.png"
import tableImg from "./assets/images/Table.png"
import sectionalImg from "./assets/images/Sectional.png"
import sofaImg from "./assets/images/Sofa.png"
import ArrowUp from "./assets/icons/ArrowUp.png"

const FEATURED_PRODUCTS = [
  {
    name: 'Trent Thin Track Arm Swivel Glider Chair',
    icon: swivelImg,
    staticFrame: true,
    byo: false,
    conftype: 'Static',
    sku: '1144-09',
    collection: null,
    breakAfter: 4,
  },
  {
    name: 'HideAway Solid Maple Trestle Extendable Counter Dining Table',
    icon: tableImg,
    staticFrame: true,
    byo: false,
    conftype: 'Static',
    sku: '4027-K3470',
    collection: null,
    breakAfter: 4,
  },
  {
    name: 'Magnificent Motion Slope Arm Reclining Sectional',
    icon: sectionalImg,
    staticFrame: false,
    byo: true,
    conftype: 'Sectional',
    sku: 'M000-LSECT3',
    collection: 'bassett',
    breakAfter: 4,
  },
  {
    name: 'Z4 Round Arm Queen Sleeper Sofa',
    icon: sofaImg,
    staticFrame: true,
    byo: false,
    conftype: 'Static',
    sku: '2848-Q2',
    collection: null,
    breakAfter: 3,
  },
]

function App() {
  const [isOpenAdditionalOption, setIsOpenAdditionalOption] = useState(false)
  const [brandInstanceConfiguratorType, setBrandInstanceConfiguratorType] = useState(null)
  const [collection, setCollection] = useState(null)
  const [activePlayer, setActivePlayer] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const handleMouseUp = () => {
      if (window.player?.isDragging) {
        window.player.onDragEnd()
      }
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const goToLanding = () => {
    setActivePlayer(null)
    setBrandInstanceConfiguratorType(null)
    setCollection(null)
    setSearchParams({})
  }

  useEffect(() => {
    const confTypeParam = searchParams.get('conftype')
    const collectionParam = searchParams.get('collection')

    if (!confTypeParam) return

    if (confTypeParam === 'Static') {
      setBrandInstanceConfiguratorType({ name: 'Static' })
      setActivePlayer('Player')
    } else if (confTypeParam === 'Sectional') {
      if (collectionParam) setCollection(collectionParam)
      setBrandInstanceConfiguratorType({ name: 'Sectional' })
      setActivePlayer('Player')
    }
  }, [searchParams])

  const handleConfigureNow = (product) => {
    const newParams = new URLSearchParams()
    newParams.set('conftype', product.conftype)
    if (product.staticFrame) {
      newParams.set('model', product.sku)
    } else if (product.byo && product.collection) {
      newParams.set('collection', product.collection)
    }
    setSearchParams(newParams)
  }

  const renderPlayer = () => {
    if (activePlayer !== 'Player') return null
    return (
      <Player
        activePlayer={activePlayer}
        isOpenAdditionalOption={isOpenAdditionalOption}
        setIsOpenAdditionalOption={setIsOpenAdditionalOption}
        brandInstanceConfiguratorType={brandInstanceConfiguratorType}
        collection={collection}
        setCollection={setCollection}
        setSearchParams={setSearchParams}
        goToLanding={goToLanding}
      />
    )
  }

  return (
    <div className='app-container'>
      {!activePlayer ? (
        <div className='landing-page'>
          <div className='landing-hero'>
            <div className='landing-brand-name'>
              <img src={mainLogo} alt='jola' className='landing-jola-logo' />
            </div>
            <div className={`landing-hero-center${isPanelOpen ? ' landing-hero-center--hidden' : ''}`}>
              <h1 className='landing-hero-title'>Explore the Possibilities</h1>
              <p className='landing-hero-subtitle'>
                This proof of concept demonstrates how CGI can transform the product discovery experience.
                Navigate through the featured models and open the configurator to explore product variations,
                materials, finishes, and interactions in a dynamic digital environment.
              </p>
            </div>
          </div>

          <div className={`product-panel${isPanelOpen ? ' product-panel--open' : ''}`}>
            <div className='product-panel-toggle' onClick={() => setIsPanelOpen((p) => !p)}>
              <button className='start-building-btn'>
                Start Building
                <img
                  src={ArrowUp}
                  alt=''
                  className='start-building-arrow'
                  style={{ transform: isPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s' }}
                />
              </button>
            </div>
            <div className='product-panel-content'>
            <div className='product-cards-grid'>
              {FEATURED_PRODUCTS.map((product, idx) => (
                <div key={idx} className='product-card' onClick={() => handleConfigureNow(product)}>
                  <div className='product-card-img-wrapper'>
                    <img
                      src={product.icon}
                      alt={product.name}
                      className='product-card-img'
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = JolaIcon
                      }}
                    />
                  </div>
                  <div className='product-card-footer'>
                    <p className='product-card-name'>
                      {product.breakAfter
                        ? (() => {
                            const words = product.name.split(' ')
                            return <>{words.slice(0, product.breakAfter).join(' ')}<br className='name-line-break' />{words.slice(product.breakAfter).join(' ')}</>
                          })()
                        : product.name
                      }
                    </p>
                    <button
                      className='configure-now-btn'
                      onClick={() => handleConfigureNow(product)}
                    >
                      Configure Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='player-container'>{renderPlayer()}</div>
      )}
    </div>
  )
}

export default App
