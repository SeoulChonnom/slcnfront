export function LiquidGlassFilter() {
  return (
    <svg
      width='0'
      height='0'
      aria-hidden='true'
      style={{ position: 'absolute', pointerEvents: 'none' }}
    >
      <filter
        id='slcnLiquidGlass'
        x='-20%'
        y='-20%'
        width='140%'
        height='140%'
        colorInterpolationFilters='sRGB'
      >
        <feTurbulence
          type='fractalNoise'
          baseFrequency='0.012 0.014'
          numOctaves='2'
          seed='7'
          result='noise'
        />
        <feGaussianBlur in='noise' stdDeviation='1.4' result='softNoise' />
        <feDisplacementMap
          in='SourceGraphic'
          in2='softNoise'
          scale='42'
          xChannelSelector='R'
          yChannelSelector='G'
        />
      </filter>
    </svg>
  );
}
