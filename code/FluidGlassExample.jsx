// IMPORTANT INFO BELOW
// This component requires a 3D model to function correctly.
// You can find three example models in the 'public/assets/3d' directory of the repository:
// - 'lens.glb'
// - 'bar.glb' 
// - 'cube.glb'
// Make sure to place these models in the correct directory or update the paths accordingly.

import FluidGlass from './FluidGlass'

export default function FluidGlassExample() {
  return (
    <div style={{ height: '600px', position: 'relative' }}>
      <FluidGlass 
        mode="lens" // or "bar", "cube"
        lensProps={{
          scale: 0.25,
          ior: 1.15,
          thickness: 5,
          chromaticAberration: 0.1,
          anisotropy: 0.01  
        }}
        barProps={} // add specific props if using bar mode
        cubeProps={} // add specific props if using cube mode
      />
    </div>
  )
}

// Alternative usage examples:

// Bar Mode Example
export function FluidGlassBarExample() {
  return (
    <div style={{ height: '600px', position: 'relative' }}>
      <FluidGlass 
        mode="bar"
        barProps={{
          navItems: [
            { label: 'Home', link: '#home' },
            { label: 'About', link: '#about' },
            { label: 'Portfolio', link: '#portfolio' },
            { label: 'Contact', link: '#contact' }
          ],
          transmission: 1,
          roughness: 0,
          thickness: 10,
          ior: 1.15
        }}
      />
    </div>
  )
}

// Cube Mode Example
export function FluidGlassCubeExample() {
  return (
    <div style={{ height: '600px', position: 'relative' }}>
      <FluidGlass 
        mode="cube"
        cubeProps={{
          scale: 0.3,
          ior: 1.2,
          thickness: 8,
          chromaticAberration: 0.15,
          anisotropy: 0.02
        }}
      />
    </div>
  )
}