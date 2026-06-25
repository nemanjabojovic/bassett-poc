import { useState } from 'react'

const LightAngleSlider = () => {
  const [lightAngle, setLightAngle] = useState(0)

  const handleAngleChange = (e) => {
    const val = Number(e.target.value)
    setLightAngle(val)
    window.player?.changeLightsSlider(val)
  }

  const handleReset = () => {
    setLightAngle(0)
    window.player?.resetLightsSlider()
  }

  return (
    <div className='light-angle-slider'>
      <span className='light-angle-label'>Light Angle</span>
      <input
        type='range'
        min={0}
        max={360}
        value={lightAngle}
        onChange={handleAngleChange}
        className='light-angle-input'
      />
      <button className='light-angle-reset' onClick={handleReset}>Reset Angle</button>
    </div>
  )
}

export default LightAngleSlider
