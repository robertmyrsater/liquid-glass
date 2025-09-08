# FluidGlass Component

A React Three Fiber component that creates a glassmorphism container with liquid distortion effects.

## Requirements

### Dependencies
```bash
npm install @react-three/drei @react-three/fiber maath three
```

### 3D Models
The component requires 3D model files to function correctly. Place these models in your `public/assets/3d/` directory:

- `lens.glb` - For lens mode
- `bar.glb` - For bar mode 
- `cube.glb` - For cube mode

### Fonts
Place the required font file in `public/assets/fonts/`:
- `figtreeblack.ttf`

## Usage

### Basic Example
```jsx
import FluidGlass from './FluidGlass'

<div style={{ height: '600px', position: 'relative' }}>
  <FluidGlass 
    mode="lens"
    lensProps={{
      scale: 0.25,
      ior: 1.15,
      thickness: 5,
      chromaticAberration: 0.1,
      anisotropy: 0.01  
    }}
  />
</div>
```

### Available Modes

1. **Lens Mode** - Interactive lens that follows mouse pointer
2. **Bar Mode** - Navigation bar with glass effect
3. **Cube Mode** - 3D cube with glass material

### Props

#### Common Props
- `mode`: 'lens' | 'bar' | 'cube' - Component mode
- `lensProps`: Props specific to lens mode
- `barProps`: Props specific to bar mode  
- `cubeProps`: Props specific to cube mode

#### Material Props (available for all modes)
- `scale`: Size scale of the 3D object
- `ior`: Index of refraction (glass clarity)
- `thickness`: Glass thickness
- `chromaticAberration`: Color separation effect
- `anisotropy`: Surface roughness
- `transmission`: Light transmission amount
- `roughness`: Surface roughness
- `color`: Glass tint color
- `attenuationColor`: Light absorption color
- `attenuationDistance`: Light absorption distance

#### Bar Mode Specific
- `navItems`: Array of navigation items with `{ label, link }` structure

## File Structure
```
project/
├── code/
│   ├── FluidGlass.jsx          # Main component
│   └── FluidGlassExample.jsx   # Usage examples
└── public/
    └── assets/
        ├── 3d/
        │   ├── lens.glb
        │   ├── bar.glb
        │   └── cube.glb
        └── fonts/
            └── figtreeblack.ttf
```