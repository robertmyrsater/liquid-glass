import { useState } from 'react'
import './PropertyControls.css'

const propertyConfigs = {
  scale: { min: 0.1, max: 1, step: 0.01, label: 'Scale' },
  ior: { min: 1, max: 2.5, step: 0.01, label: 'Index of Refraction' },
  thickness: { min: 0.1, max: 20, step: 0.1, label: 'Thickness' },
  chromaticAberration: { min: 0, max: 1, step: 0.01, label: 'Chromatic Aberration' },
  anisotropy: { min: 0, max: 1, step: 0.01, label: 'Anisotropy' },
  transmission: { min: 0, max: 1, step: 0.01, label: 'Transmission' },
  roughness: { min: 0, max: 1, step: 0.01, label: 'Roughness' },
  attenuationDistance: { min: 0.1, max: 2, step: 0.01, label: 'Attenuation Distance' }
}

function PropertyControls({ properties, onPropertyChange, mode }) {
  const [isMinimized, setIsMinimized] = useState(false)

  const getRelevantProperties = () => {
    switch (mode) {
      case 'lens':
        return ['scale', 'ior', 'thickness', 'chromaticAberration', 'anisotropy']
      case 'cube':
        return ['scale', 'ior', 'thickness', 'chromaticAberration', 'anisotropy']
      case 'bar':
        return ['transmission', 'roughness', 'thickness', 'ior', 'attenuationDistance']
      default:
        return Object.keys(propertyConfigs)
    }
  }

  return (
    <div className={`property-controls ${isMinimized ? 'minimized' : ''}`}>
      <div className="controls-header">
        <h3>Glass Properties ({mode} mode)</h3>
        <button 
          className="minimize-btn"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>
      
      {!isMinimized && (
        <div className="controls-content">
          {getRelevantProperties().map((property) => {
            const config = propertyConfigs[property]
            const value = properties[property]
            
            return (
              <div key={property} className="control-group">
                <label>
                  {config.label}
                  <span className="value">{value?.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={value || config.min}
                  onChange={(e) => onPropertyChange(property, parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            )
          })}
          
          <div className="preset-buttons">
            <button 
              onClick={() => {
                const presets = {
                  lens: { scale: 0.25, ior: 1.05, thickness: 5, chromaticAberration: 0.01, anisotropy: 0.01 },
                  cube: { scale: 0.3, ior: 1.05, thickness: 8, chromaticAberration: 0.01, anisotropy: 0.02 },
                  bar: { transmission: 1, roughness: 0, thickness: 10, ior: 1.05, attenuationDistance: 0.25 }
                }
                Object.entries(presets[mode]).forEach(([key, value]) => {
                  onPropertyChange(key, value)
                })
              }}
              className="preset-btn"
            >
              Reset to Default
            </button>
            
            <button 
              onClick={() => {
                const extremes = {
                  lens: { scale: 0.5, ior: 2, thickness: 15, chromaticAberration: 0.5, anisotropy: 0.1 },
                  cube: { scale: 0.8, ior: 2.2, thickness: 18, chromaticAberration: 0.8, anisotropy: 0.2 },
                  bar: { transmission: 0.5, roughness: 0.3, thickness: 20, ior: 2, attenuationDistance: 1.5 }
                }
                Object.entries(extremes[mode]).forEach(([key, value]) => {
                  onPropertyChange(key, value)
                })
              }}
              className="preset-btn"
            >
              Extreme Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyControls