import React from 'react';
import styled from 'styled-components';

const SPHERE_COUNT = 9;
const ITEMS_PER_SPHERE = 9;

const Loader = () => {
  return (
    <StyledWrapper 
      role="progressbar" 
      aria-label="Loading..." 
      aria-busy="true"
    >
      <div className="loader">
        {[...Array(SPHERE_COUNT)].map((_, sphereIndex) => (
          <article 
            key={`sphere-${sphereIndex}`} 
            className={`sphere sphere${sphereIndex + 1}`}
            style={{ '--rot': sphereIndex }}
          >
            {[...Array(ITEMS_PER_SPHERE)].map((_, itemIndex) => (
              <div 
                key={`item-${itemIndex}`} 
                className="item"
                style={{ '--rot-y': itemIndex + 1 }}
              />
            ))}
          </article>
        ))}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
  
  .loader {
    position: relative;
    width: 100px;
    height: 100px;
    transform-style: preserve-3d;
    perspective: 10000px;
    animation: rotate3D 8s linear infinite;
    will-change: transform;
    scale: 0.5;
  }

  .sphere {
    width: 100px;
    height: 100px;
    position: absolute;
    transform-style: preserve-3d;
    perspective: 10000px;
    top: 0;
    left: 0;
    transform: rotate(calc(var(--rot) * 20deg));
    will-change: transform;
  }

  .item {
    width: 100px;
    height: 100px;
    position: absolute;
    transform-style: preserve-3d;
    perspective: 10000px;
    top: 0;
    left: 0;
    border-radius: 50%;
    transform: rotateY(calc(var(--rot-y) * 40deg));
    will-change: transform;
    backface-visibility: hidden;
  }

  .sphere1 .item { --bg: rgba(255, 0, 0, 0.333); }
  .sphere2 .item { --bg: rgba(255, 0, 255, 0.333); }
  .sphere3 .item { --bg: rgba(255, 255, 0, 0.333); }
  .sphere4 .item { --bg: rgba(0, 255, 0, 0.333); }
  .sphere5 .item { --bg: rgba(0, 255, 255, 0.333); }
  .sphere6 .item { --bg: rgba(0, 0, 255, 0.333); }
  .sphere7 .item { --bg: rgba(220, 29, 223, 0.333); }
  .sphere8 .item { --bg: rgba(255, 165, 0, 0.333); }
  .sphere9 .item { --bg: rgba(229, 178, 202, 0.333); }

  .item {
    background: var(--bg);
  }

  @keyframes rotate3D {
    0% {
      transform: rotateX(0deg) rotateY(0deg);
    }
    100% {
      transform: rotateX(360deg) rotateY(360deg);
    }
  }
`;

export default Loader;
