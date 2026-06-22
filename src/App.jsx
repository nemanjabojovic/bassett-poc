import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import Player from "./pages/Player.jsx"
import JolaIcon from "./assets/icons/jolaLogo.svg"
import mainLogo from "./assets/images/main_logo.png"
import brandsAndRules from "./data/BrandsAndRules.json"
import dataJson from "./components/JolaPlayer/data.json"
import swivelImg from "./assets/images/Swivel.png"
import tableImg from "./assets/images/Table.png"
import sectionalImg from "./assets/images/Sectional.png"
import sofaImg from "./assets/images/Sofa.png"

const FEATURED_PRODUCTS = [
  {
    name: 'Trent Thin Track Arm Swivel Glider Chair',
    icon: swivelImg,
    staticFrame: true,
    byo: false,
    brand: 'BY',
    conftype: 'Static Frames',
    sku: '1144-09',
    collection: null,
  },
  {
    name: 'HideAway Solid Maple Trestle Extendable Counter Dining Table',
    icon: tableImg,
    staticFrame: true,
    byo: false,
    brand: 'BY',
    conftype: 'Static Frames',
    sku: '4027-K3470',
    collection: null,
  },
  {
    name: 'Magnificent Motion Slope Arm Reclining Sectional',
    icon: sectionalImg,
    staticFrame: false,
    byo: true,
    brand: 'BY',
    conftype: 'Build Your Own',
    sku: 'M000-LSECT3',
    collection: 'bassett',
  },
  {
    name: 'Z4 Round Arm Queen Sleeper Sofa',
    icon: sofaImg,
    staticFrame: true,
    byo: false,
    brand: 'BY',
    conftype: 'Static Frames',
    sku: '2848-Q2_Z4',
    collection: null,
  },
]

function App() {
  const [itemClicked, setItemClicked] = useState(null)
  const [isOpenAdditionalOption, setIsOpenAdditionalOption] = useState(false)
  const [showOrientationOptions, setShowOrientationOptions] = useState(false)
  const [isLeftSidebar, setIsLeftSidebar] = useState(true)
  const [playerInstance, setPlayerInstance] = useState(null)
  const [brandInstance, setBrandInstance] = useState(null)
  const [brandInstanceConfiguratorType, setBrandInstanceConfiguratorType] = useState(null)
  const [staticFramesConfiguratorType, setStaticFramesConfiguratorType] = useState(null)
  const [collection, setCollection] = useState(null)
  const [staticModelWithAnimation, setStaticModelWithAnimation] = useState(null)
  const [modelPath, setModelPath] = useState(null)
  const [activePlayer, setActivePlayer] = useState(null)
  const [currentClassList, setCurrentClassList] = useState(null)
  const [additionalOptionsCollectionFilter, setAdditionalOptionsCollectionFilter] = useState(null)
  const [searchParamsModel, setSearchParamsModel] = useState(null)
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

  window.setIsLeftSidebar = true

  const camelCase = (str) =>
    str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '')

  const toSlug = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const toAdditionalOptionsByCollection = (brand, buildYourOwnConfig, collectionOptions) => {
    const optionTypesByCollection =
      buildYourOwnConfig.additionalOptionsRules?.optionTypesByCollection || {}
    const result = {}

    buildYourOwnConfig.collections.forEach((collectionName) => {
      const collectionKey = camelCase(collectionName)
      const collectionSlug = toSlug(collectionName)
      const optionTypes = optionTypesByCollection[collectionKey] || []
      const collectionOptionsByType = {}

      optionTypes.forEach((typeName) => {
        const sourceItems = Array.isArray(collectionOptions[typeName])
          ? collectionOptions[typeName]
          : []

        const directMatches = sourceItems.filter(
          (item) =>
            item.brandId === brand.brandShorthand &&
            toSlug(item.collection) === collectionSlug
        )
        const fallbackMatches = sourceItems.filter(
          (item) => toSlug(item.collection) === collectionSlug
        )
        const selected = directMatches.length ? directMatches : fallbackMatches

        if (selected.length) {
          collectionOptionsByType[typeName] = selected.map((item) => ({ ...item }))
        }
      })

      if (Object.keys(collectionOptionsByType).length) {
        result[collectionKey] = collectionOptionsByType
      }
    })

    return result
  }

  const Brands = useMemo(() => {
    const collectionOptions = dataJson.collectionOptions || {}
    return brandsAndRules.brands.map((brand) => ({
      ...brand,
      configuratorTypes: brand.configuratorTypes.map((configType) => {
        if (configType.name !== 'Build Your Own') return { ...configType }
        return {
          ...configType,
          additionalOptions: toAdditionalOptionsByCollection(brand, configType, collectionOptions),
        }
      }),
    }))
  }, [])

  const handleAddParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set(key, value)
    setSearchParams(newParams)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsLeftSidebar(!window.matchMedia('(max-width: 1400px)').matches)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleOrientationOptions = () => {
    setShowOrientationOptions((prev) => !prev)
  }

  const goToLanding = () => {
    setActivePlayer(null)
    setBrandInstance(null)
    setBrandInstanceConfiguratorType(null)
    setCollection(null)
    setSearchParamsModel(null)
    setSearchParams({})
  }

  useEffect(() => {
    if (brandInstance && brandInstanceConfiguratorType && collection) {
      setAdditionalOptionsCollectionFilter(camelCase(collection))
    }
  }, [brandInstance, brandInstanceConfiguratorType, collection])

  useEffect(() => {
    const brandParam = searchParams.get('brand')
    const confTypeParam = searchParams.get('conftype')
    const collectionParam = searchParams.get('collection')
    const modelParam = searchParams.get('model')

    if (brandParam) {
      const selectedBrand = Brands.find((b) => b.brandShorthand === brandParam)
      if (selectedBrand) {
        setBrandInstance(selectedBrand)
        setModelPath(selectedBrand.modelPath)

        if (modelParam) {
          setSearchParamsModel(modelParam)
        }

        if (confTypeParam) {
          const configuratorType = selectedBrand.configuratorTypes.find(
            (type) => type.name === decodeURIComponent(confTypeParam)
          )
          if (configuratorType) {
            setBrandInstanceConfiguratorType(configuratorType)

            if (configuratorType.name === 'Static Frames') {
              setStaticFramesConfiguratorType(true)
              setActivePlayer('Player')
            }

            if (collectionParam && configuratorType.collections) {
              const decodedCollection = decodeURIComponent(collectionParam)
              if (configuratorType.collections.includes(decodedCollection)) {
                setCollection(collectionParam)
                setStaticFramesConfiguratorType(false)
                setActivePlayer('Player')
              }
            }
          }
        }
      }
    }
  }, [searchParams, Brands])

  const handleConfigureNow = (product) => {
    const newParams = new URLSearchParams()
    newParams.set('brand', product.brand)
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
        itemClicked={itemClicked}
        setItemClicked={setItemClicked}
        isOpenAdditionalOption={isOpenAdditionalOption}
        showOrientationOptions={showOrientationOptions}
        setIsOpenAdditionalOption={setIsOpenAdditionalOption}
        setIsLeftSidebar={setIsLeftSidebar}
        isLeftSidebar={isLeftSidebar}
        playerInstance={playerInstance}
        toggleOrientationOptions={toggleOrientationOptions}
        activePlayer={activePlayer}
        setPlayerInstance={setPlayerInstance}
        currentClassList={currentClassList}
        setCurrentClassList={setCurrentClassList}
        modelPath={modelPath}
        setModelPath={setModelPath}
        brandInstance={brandInstance}
        setBrandInstance={setBrandInstance}
        brandInstanceConfiguratorType={brandInstanceConfiguratorType}
        setBrandInstanceConfiguratorType={setBrandInstanceConfiguratorType}
        collection={collection}
        setCollection={setCollection}
        staticFramesConfiguratorType={staticFramesConfiguratorType}
        searchParamsModel={searchParamsModel}
        setSearchParamsModel={setSearchParamsModel}
        setSearchParams={setSearchParams}
        handleAddParam={handleAddParam}
        additionalOptionsCollectionFilter={additionalOptionsCollectionFilter}
        staticModelWithAnimation={staticModelWithAnimation}
        setStaticModelWithAnimation={setStaticModelWithAnimation}
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
          </div>

          <div className={`product-panel${isPanelOpen ? ' product-panel--open' : ''}`}>
            <div className='product-panel-toggle' onClick={() => setIsPanelOpen((p) => !p)}>
              <button className='start-building-btn'>
                Start Building
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  style={{ transform: isPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s' }}
                >
                  <path d='M3 6l5 5 5-5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </button>
            </div>
            <div className='product-panel-content'>
            <div className='product-cards-grid'>
              {FEATURED_PRODUCTS.map((product, idx) => (
                <div key={idx} className='product-card'>
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
                    <p className='product-card-name'>{product.name}</p>
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
