import { useState } from 'react'
import FluidGlass from './FluidGlass'
import PropertyControls from './PropertyControls'
import './App.css'

function App() {
  const [mode, setMode] = useState('lens')
  const [properties, setProperties] = useState({
    scale: 0.25,
    ior: 1.05,
    thickness: 5,
    chromaticAberration: 0.01,
    anisotropy: 0.01,
    transmission: 1,
    roughness: 0,
    attenuationDistance: 0.25
  })

  const navItems = [
    { label: 'Home', link: '#home' },
    { label: 'About', link: '#about' },
    { label: 'Portfolio', link: '#portfolio' },
    { label: 'Contact', link: '#contact' }
  ]

  const handlePropertyChange = (property, value) => {
    setProperties(prev => ({
      ...prev,
      [property]: value
    }))
  }

  return (
    <div className="app">
      <div className="controls">
        <h1>FluidGlass Demo</h1>
        <div className="mode-selector">
          <button 
            className={mode === 'lens' ? 'active' : ''} 
            onClick={() => setMode('lens')}
          >
            Lens
          </button>
          <button 
            className={mode === 'cube' ? 'active' : ''} 
            onClick={() => setMode('cube')}
          >
            Cube
          </button>
          <button 
            className={mode === 'bar' ? 'active' : ''} 
            onClick={() => setMode('bar')}
          >
            Bar
          </button>
        </div>
      </div>
      
      <PropertyControls 
        properties={properties}
        onPropertyChange={handlePropertyChange}
        mode={mode}
      />
      
      <div className="canvas-container">
        <FluidGlass 
          mode={mode}
          lensProps={properties}
          barProps={{
            navItems,
            ...properties
          }}
          cubeProps={properties}
        />
      </div>
    </div>
  )
}

export default App