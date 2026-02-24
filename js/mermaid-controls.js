/**
 * Mermaid diagram zoom and fullscreen functionality
 */
(function() {
  'use strict';

  // Wait for mermaid to render, then add controls
  function initMermaidControls() {
    const mermaidPreElements = document.querySelectorAll('pre.mermaid');

    mermaidPreElements.forEach(function(pre) {
      // Skip if already processed
      if (pre.dataset.mermaidInitialized) return;

      // Check if mermaid has rendered (has svg child)
      const hasSvg = pre.querySelector('svg');
      
      // Only process if mermaid has rendered
      if (!hasSvg) {
        // Wait for mermaid to render
        setTimeout(function() {
          initMermaidControls();
        }, 500);
        return;
      }

      // Mark as initialized
      pre.dataset.mermaidInitialized = 'true';

      // Add controls wrapper
      pre.style.position = 'relative';

      // Create control buttons
      const controls = document.createElement('div');
      controls.className = 'mermaid-controls';

      // Zoom in button
      const zoomInBtn = document.createElement('button');
      zoomInBtn.className = 'mermaid-zoom-in';
      zoomInBtn.innerHTML = '+';
      zoomInBtn.title = '放大';

      // Zoom out button
      const zoomOutBtn = document.createElement('button');
      zoomOutBtn.className = 'mermaid-zoom-out';
      zoomOutBtn.innerHTML = '−';
      zoomOutBtn.title = '缩小';

      // Reset zoom button
      const resetBtn = document.createElement('button');
      resetBtn.className = 'mermaid-reset';
      resetBtn.innerHTML = '↺';
      resetBtn.title = '重置';

      // Fullscreen button
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.className = 'mermaid-fullscreen';
      fullscreenBtn.innerHTML = '⛶';
      fullscreenBtn.title = '全屏';

      controls.appendChild(zoomInBtn);
      controls.appendChild(zoomOutBtn);
      controls.appendChild(resetBtn);
      controls.appendChild(fullscreenBtn);

      // Append controls to pre element
      pre.appendChild(controls);

      // Get the diagram element (svg)
      const diagram = pre.querySelector('svg');
      if (!diagram) return;

      // Current zoom level
      let currentZoom = 1;
      const ZOOM_STEP = 0.1;
      const MIN_ZOOM = 0.5;
      const MAX_ZOOM = 3;

      // Create a wrapper for the diagram
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-diagram-wrapper';
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'auto';
      wrapper.style.maxWidth = '100%';
      
      // Insert wrapper before diagram and move diagram into wrapper
      diagram.parentNode.insertBefore(wrapper, diagram);
      wrapper.appendChild(diagram);

      // Zoom in
      zoomInBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentZoom < MAX_ZOOM) {
          currentZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
          diagram.style.transform = 'scale(' + currentZoom + ')';
          diagram.style.transformOrigin = 'top left';
        }
      });

      // Zoom out
      zoomOutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentZoom > MIN_ZOOM) {
          currentZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
          diagram.style.transform = 'scale(' + currentZoom + ')';
          diagram.style.transformOrigin = 'top left';
        }
      });

      // Reset zoom
      resetBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentZoom = 1;
        diagram.style.transform = 'scale(1)';
      });

      // Fullscreen
      fullscreenBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          pre.requestFullscreen().catch(function(err) {
            console.log('Fullscreen error:', err);
          });
        }
      });

      // Click on diagram to toggle controls visibility
      wrapper.addEventListener('click', function() {
        controls.classList.toggle('visible');
      });
    });
  }

  // Initialize when DOM is ready and mermaid has loaded
  function startInit() {
    // Try to initialize
    initMermaidControls();
    
    // Also try again after a delay to catch any late-rendering diagrams
    setTimeout(initMermaidControls, 1000);
    setTimeout(initMermaidControls, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInit);
  } else {
    startInit();
  }

})();
