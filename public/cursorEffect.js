// Blue Flame Cursor Trail Effect
document.addEventListener('DOMContentLoaded', function() {
  // Create container for cursor trail
  const container = document.createElement('div');
  container.className = 'cursor-trail-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
  document.body.appendChild(container);
  
  // Trail settings
  const settings = {
    particles: [],
    maxParticles: 150,
    baseSize: 20,
    trailLength: 20,
    fadeSpeed: 0.96,
    growSpeed: 1.05,
    baseHue: 190, // Cyan/blue
    glowIntensity: '20px',
    mouseX: 0,
    mouseY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    velocityX: 0,
    velocityY: 0
  };
  
  // Update mouse position and calculate velocity
  document.addEventListener('mousemove', function(e) {
    settings.velocityX = e.clientX - settings.mouseX;
    settings.velocityY = e.clientY - settings.mouseY;
    
    settings.lastMouseX = settings.mouseX;
    settings.lastMouseY = settings.mouseY;
    
    settings.mouseX = e.clientX;
    settings.mouseY = e.clientY;
    
    // Create particles based on mouse speed
    const speed = Math.sqrt(
      settings.velocityX * settings.velocityX + 
      settings.velocityY * settings.velocityY
    );
    
    // Create more particles when moving faster
    const particlesToCreate = Math.min(Math.floor(speed / 2), 5);
    
    for (let i = 0; i < particlesToCreate; i++) {
      createParticle();
    }
  });
  
  // Create extra particles on click
  document.addEventListener('click', function(e) {
    settings.mouseX = e.clientX;
    settings.mouseY = e.clientY;
    
    // Create a burst of particles
    for (let i = 0; i < 15; i++) {
      createParticle(true);
    }
  });
  
  function createParticle(isBurst = false) {
    // If we hit the particle limit, remove oldest
    if (settings.particles.length >= settings.maxParticles) {
      const oldestParticle = settings.particles.shift();
      container.removeChild(oldestParticle.element);
    }
    
    // Create the element
    const element = document.createElement('div');
    
    // Calculate size - larger at the cursor, smaller as it trails
    const size = isBurst ? 
      settings.baseSize * (1 + Math.random()) : 
      settings.baseSize * (0.5 + Math.random() * 0.5);
    
    // Random slight variation in hue for visual interest
    const hue = settings.baseHue + (Math.random() * 20 - 10);
    
    // Calculate position - add slight variation for burst effect
    const posX = settings.mouseX + (isBurst ? (Math.random() * 20 - 10) : 0);
    const posY = settings.mouseY + (isBurst ? (Math.random() * 20 - 10) : 0);
    
    // Calculate direction based on mouse velocity
    let directionX, directionY;
    
    if (isBurst) {
      // Burst in all directions
      const angle = Math.random() * Math.PI * 2;
      directionX = Math.cos(angle) * (Math.random() * 3 + 2);
      directionY = Math.sin(angle) * (Math.random() * 3 + 2);
    } else {
      // Follow mouse direction but with slight variation
      directionX = -settings.velocityX * (0.3 + Math.random() * 0.2);
      directionY = -settings.velocityY * (0.3 + Math.random() * 0.2);
    }
    
    // Add some randomness to direction
    directionX += (Math.random() - 0.5) * 2;
    directionY += (Math.random() - 0.5) * 2;
    
    // Create particle with elongated/directional shape
    const transform = `rotate(${Math.atan2(directionY, directionX) * 180 / Math.PI}deg)`;
    
    // Set styles for flame-like appearance
    element.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size * 1.5}px;
      left: ${posX}px;
      top: ${posY}px;
      border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
      background: radial-gradient(
        circle at 50% 40%, 
        rgba(255, 255, 255, 0.8) 0%, 
        rgba(32, 196, 255, 0.8) 45%, 
        rgba(0, 128, 255, 0.4) 80%,
        transparent 100%
      );
      box-shadow: 0 0 ${settings.glowIntensity} ${Math.floor(size/3)}px rgba(0, 195, 255, 0.6);
      transform: ${transform} scale(1);
      opacity: ${isBurst ? 0.9 : 0.7};
      transform-origin: center bottom;
      pointer-events: none;
    `;
    
    // Add to DOM
    container.appendChild(element);
    
    // Create particle object
    const particle = {
      element: element,
      size: size,
      x: posX,
      y: posY,
      directionX: directionX,
      directionY: directionY,
      life: 100,
      rotation: Math.atan2(directionY, directionX),
      opacity: isBurst ? 0.9 : 0.7
    };
    
    // Add to particles array
    settings.particles.push(particle);
  }
  
  function updateParticles() {
    // Update and animate each particle
    for (let i = 0; i < settings.particles.length; i++) {
      const p = settings.particles[i];
      
      // Move particle in its direction
      p.x += p.directionX;
      p.y += p.directionY;
      
      // Update position
      p.element.style.left = `${p.x}px`;
      p.element.style.top = `${p.y}px`;
      
      // Apply physics - slow down gradually
      p.directionX *= 0.98;
      p.directionY *= 0.98;
      
      // Add slight upward drift for flame effect
      p.directionY -= 0.05;
      
      // Reduce size (shrink as it fades)
      p.size *= settings.fadeSpeed;
      p.opacity *= settings.fadeSpeed;
      
      // Reduce life
      p.life -= 1;
      
      // Update visual properties
      p.element.style.opacity = p.opacity;
      p.element.style.width = `${p.size}px`;
      p.element.style.height = `${p.size * 1.5}px`;
      
      // Adjust transform for directional flow
      const newRotation = Math.atan2(p.directionY, p.directionX);
      p.rotation = p.rotation * 0.95 + newRotation * 0.05;
      p.element.style.transform = `rotate(${p.rotation * 180 / Math.PI}deg) scale(${p.size / settings.baseSize})`;
      
      // Remove dead particles
      if (p.life <= 0 || p.size < 1 || p.opacity < 0.05) {
        container.removeChild(p.element);
        settings.particles.splice(i, 1);
        i--;
      }
    }
    
    // Continue animation
    requestAnimationFrame(updateParticles);
  }
  
  // Create initial particles
  for (let i = 0; i < 10; i++) {
    settings.mouseX = Math.random() * window.innerWidth;
    settings.mouseY = Math.random() * window.innerHeight;
    createParticle(true);
  }
  
  // Start animation loop
  updateParticles();
}); 