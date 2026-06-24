import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import data from '../components/JolaPlayer/data.json'
import JolaPlayer from '../components/JolaPlayer'
import { resolveModelOptions } from '../components/JolaPlayer/utils'
import StaticFramePanel from '../components/StaticFramePanel'
import SectionalPanel from '../components/SectionalPanel'
import JolaIcon from '../assets/icons/jolaLogo.svg'
import AdditionalOptions from '../components/AdditionalOptions'

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

const Player = ({
  activePlayer,
  setPlayerInstance,
  modelPath,
  brandInstance,
  brandInstanceConfiguratorType,
  setBrandInstanceConfiguratorType,
  collection,
  setCollection,
  setSearchParams,
  setSearchParamsModel,
  handleAddParam,
  additionalOptionsCollectionFilter,
  setStaticModelWithAnimation,
  staticModelWithAnimation,
  isOpenAdditionalOption,
  setIsOpenAdditionalOption,
  goToLanding,
}) => {
  const playerRef = useRef()
  const [skuToLoad, setSkuToLoad] = useState(null)
  const [playerOptions, setPlayerOptions] = useState(null)
  const [configurationToLoad, setConfigurationToLoad] = useState(null)
  const [searchParams] = useSearchParams()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    const paramsObject = {}
    for (const [key, value] of searchParams.entries()) {
      paramsObject[key] = value
    }

    let sku
    if (paramsObject.collection) {
      const formattedCollection = paramsObject.collection.split(' ').join('-').toLowerCase()
      const firstArm = data.collectionOptions.armTypes.find(
        a => a.collection === formattedCollection
      )
      const firstConfig = data.popularConfigurations.find(
        pc => pc.collection === formattedCollection
      )
      if (firstArm && firstConfig) {
        sku = `${firstArm.sku}-${firstConfig.elements[0].id}`
      } else if (firstConfig) {
        sku = firstConfig.elements[0].id
      }
      setConfigurationToLoad(firstConfig || null)
      setSkuToLoad(sku)
    } else if (paramsObject.model) {
      setSkuToLoad(paramsObject.model)
    } else {
      const frame = data.frames.find(f => f.brandId === paramsObject.brand)
      if (frame) setSkuToLoad(frame.sku)
    }
  }, [collection, brandInstance, searchParams])

  useEffect(() => {
    if (!skuToLoad) return

    const options = resolveModelOptions(skuToLoad)
    if (!options) return

    options.containerId = 'player'
    options.loadingScreenId = 'loading-screen'

    if (options?.frame?.nails) {
      options.nailOptions = {
        nailsColor: options.frame.nails.defaultNailFinish,
        nailOptionStandard: options.frame.nails.defaultStandardNail,
        nailOptionStandard2: options.frame.nails.defaultStandardNail2,
      }
    }

    options.fabric = [{ texture: data.fabrics[0], name: 'PrimaryCover' }]
    options.popularConfiguration = configurationToLoad
    options.data = data

    setPlayerOptions(options)
  }, [skuToLoad, configurationToLoad])

  const isStaticFrame = brandInstanceConfiguratorType?.name === 'Static'
  const currentSku = searchParams.get('model') || skuToLoad

  const handleClearConfirm = () => {
    window.player?.clearConfiguration()
    setShowClearConfirm(false)
  }

  return (
    <div className='configurator-view'>
      {showClearConfirm && (
        <ClearConfirmModal
          onConfirm={handleClearConfirm}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
      <div className='viewer-area'>
        <div id='loading-screen' className='flex-column'>
          <div aria-busy='true' id='loading-screen-img'>
            <div className='loader-container'>
              <div className='container'>
                <div className='composition'>
                  <div className='dot-orbit orbit'>
                    <div className='full dot'></div>
                    <div className='ring'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='viewer-nav'>
          <img src={JolaIcon} alt='Jola' className='viewer-jola-logo' onClick={goToLanding} />
          <AdditionalOptions
            isOpenAdditionalOption={isOpenAdditionalOption}
            setIsOpenAdditionalOption={setIsOpenAdditionalOption}
          />
        </div>

        {playerOptions && <JolaPlayer ref={playerRef} options={playerOptions} />}

        <div className='viewer-footer'>
          <div className='viewer-footer-dims'>
            <span>Height {playerOptions?.frame?.height || '--'}</span>
            <span>Width {playerOptions?.frame?.width || '--'}</span>
            <span>Depth {playerOptions?.frame?.depth || '--'}</span>
          </div>
          <div className='viewer-footer-right'>
            <button className='viewer-clear-btn' onClick={() => setShowClearConfirm(true)}>
              <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
                <path d='M1 3h12M5 3V2h4v1M2 3l1 9h8l1-9' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              Clear Configuration
            </button>
            <span className='viewer-price'>
              {playerOptions?.frame?.price != null
                ? `$${playerOptions.frame.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '$0.00'}
            </span>
          </div>
        </div>
      </div>

      {isStaticFrame ? (
        <StaticFramePanel
          sku={currentSku}
          frame={playerOptions?.frame}
          onClose={goToLanding}
        />
      ) : (
        <SectionalPanel
          sku={currentSku}
          frame={playerOptions?.frame}
          onClose={goToLanding}
        />
      )}
    </div>
  )
}

export default Player
