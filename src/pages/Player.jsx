import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import data from '../components/JolaPlayer/data.json'
import JolaPlayer from '../components/JolaPlayer'
import { resolveModelOptions } from '../components/JolaPlayer/utils'
import StaticFramePanel from '../components/StaticFramePanel'
import SectionalPanel from '../components/SectionalPanel'
import JolaIcon from '../assets/icons/jolaLogo.svg'
import backArrow from '../assets/icons/arrow-back.svg'

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
  goToLanding,
}) => {
  const playerRef = useRef()
  const [skuToLoad, setSkuToLoad] = useState(null)
  const [playerOptions, setPlayerOptions] = useState(null)
  const [configurationToLoad, setConfigurationToLoad] = useState(null)
  const [searchParams] = useSearchParams()

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

  return (
    <div className='configurator-view'>
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
          <img src={JolaIcon} alt='Jola' className='viewer-jola-logo' />
          <button className='viewer-back-btn' onClick={goToLanding}>
            <img src={backArrow} alt='Back' />
          </button>
        </div>

        <div id='player'>
          {playerOptions && <JolaPlayer ref={playerRef} options={playerOptions} />}
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
