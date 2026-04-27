// ── Redesign Output Module (Phase 2) ──────────────────────────────────
// Handles metrics display, movement tracking, and UI for redesigned city layouts

/**
 * Render metrics comparison panel with before/after/delta for all metrics
 * @param {Object} metricsData - { roads, clustering, identical, space, custom... }
 *   Each metric should have: { before: number, after: number, label: string }
 */
function renderMetricsComparison(metricsData) {
  const metricsList = document.getElementById('metrics-list');
  if (!metricsList) return;
  
  metricsList.innerHTML = '';
  
  if (!metricsData || Object.keys(metricsData).length === 0) {
    metricsList.innerHTML = '<p style="color: #8a9aaa; font-size: 0.73rem;">No metrics available</p>';
    return;
  }
  
  for (const [key, metric] of Object.entries(metricsData)) {
    if (!metric.before || metric.after === undefined) continue;
    
    const before = typeof metric.before === 'number' ? metric.before : parseFloat(metric.before);
    const after = typeof metric.after === 'number' ? metric.after : parseFloat(metric.after);
    const delta = after - before;
    const deltaPercent = before !== 0 ? ((delta / before) * 100).toFixed(1) : 0;
    
    const row = document.createElement('div');
    row.className = 'metric-row';
    
    const label = document.createElement('div');
    label.className = 'metric-label';
    label.textContent = metric.label || key;
    
    const values = document.createElement('div');
    values.className = 'metric-values';
    
    // Format numbers with appropriate precision
    const beforeStr = formatMetricNumber(before);
    const afterStr = formatMetricNumber(after);
    const deltaStr = formatMetricDelta(delta, deltaPercent, metric.isPercentage);
    
    values.innerHTML = `
      <span class="before">Before: ${beforeStr}</span>
      <span class="after">After: ${afterStr}</span>
      <span class="delta ${delta > 0 && !metric.goodIfPositive ? 'negative' : ''}">${deltaStr}</span>
    `;
    
    row.appendChild(label);
    row.appendChild(values);
    metricsList.appendChild(row);
  }
}

/**
 * Format a metric number with appropriate precision
 */
function formatMetricNumber(num) {
  if (typeof num !== 'number') return String(num);
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(2);
}

/**
 * Format delta with absolute value and percentage
 */
function formatMetricDelta(delta, percent, isPercentage = false) {
  const sign = delta > 0 ? '+' : '';
  const deltaStr = formatMetricNumber(delta);
  
  if (isPercentage) {
    return `${sign}${deltaStr}`;
  }
  
  return `${sign}${deltaStr} (${sign}${percent}%)`;
}

/**
 * Build movement changelog by comparing original and redesigned building positions
 * @param {Array} originalBuildings - Original building list
 * @param {Array} redesignedBuildings - Redesigned building list
 * @returns {Object} { movedCount, unchangedCount, changes: Array }
 */
function buildMovementChangelog(originalBuildings, redesignedBuildings) {
  if (!originalBuildings || !redesignedBuildings) {
    return { movedCount: 0, unchangedCount: 0, changes: [] };
  }
  
  // Create a map of redesigned buildings by name/type for comparison
  const redesignedMap = new Map();
  redesignedBuildings.forEach(b => {
    const key = `${b.name}|${b.type}`;
    if (!redesignedMap.has(key)) {
      redesignedMap.set(key, []);
    }
    redesignedMap.get(key).push(b);
  });
  
  const changes = [];
  let movedCount = 0;
  let unchangedCount = 0;
  
  for (const original of originalBuildings) {
    const key = `${original.name}|${original.type}`;
    const redesignedList = redesignedMap.get(key);
    
    if (!redesignedList || redesignedList.length === 0) {
      // Building not found in redesigned - skip (shouldn't happen in normal flow)
      continue;
    }
    
    // Match with closest position if multiple exist
    const redesigned = findClosestBuilding(original, redesignedList);
    redesignedList.splice(redesignedList.indexOf(redesigned), 1);
    
    const moved = original.x !== redesigned.x || original.y !== redesigned.y;
    
    if (moved) {
      const distance = calculateDistance(original.x, original.y, redesigned.x, redesigned.y);
      const typeLabel = getTypeLabel(original.type);
      
      changes.push({
        name: original.name,
        type: typeLabel,
        originalX: original.x,
        originalY: original.y,
        newX: redesigned.x,
        newY: redesigned.y,
        distance: distance,
      });
      movedCount++;
    } else {
      unchangedCount++;
    }
  }
  
  // Sort by distance (descending) to show biggest moves first
  changes.sort((a, b) => b.distance - a.distance);
  
  return { movedCount, unchangedCount, changes };
}

/**
 * Find the closest building from a list to match with original
 */
function findClosestBuilding(original, redesignedList) {
  if (redesignedList.length === 1) return redesignedList[0];
  
  let closest = redesignedList[0];
  let minDist = calculateDistance(original.x, original.y, closest.x, closest.y);
  
  for (let i = 1; i < redesignedList.length; i++) {
    const dist = calculateDistance(original.x, original.y, redesignedList[i].x, redesignedList[i].y);
    if (dist < minDist) {
      closest = redesignedList[i];
      minDist = dist;
    }
  }
  
  return closest;
}

/**
 * Calculate Euclidean distance between two grid positions
 */
function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get friendly label for building type
 */
function getTypeLabel(type) {
  const TYPE_LABELS = {
    main_building:    'Town Hall',
    generic_building: 'Generic / Special',
    military:         'Military',
    residential:      'Residential',
    hub_main:         'Guild Hub (main)',
    hub_part:         'Guild Hub (part)',
    production:       'Production',
    outpost_ship:     'Outpost / Ship',
    decoration:       'Decoration',
    tower:            'Tower / Flame',
    friends_tavern:   'Friends Tavern',
    greatbuilding:    'Great Building',
  };
  return TYPE_LABELS[type] || type;
}

/**
 * Display movement summary and details in the metrics panel
 */
function displayMovementInfo(movementData) {
  const movedCount = document.getElementById('moved-count');
  const unchangedCount = document.getElementById('unchanged-count');
  const expandBtn = document.getElementById('expand-movement-btn');
  const movementDetails = document.getElementById('movement-details');
  
  if (movedCount) movedCount.textContent = movementData.movedCount;
  if (unchangedCount) unchangedCount.textContent = movementData.unchangedCount;
  
  // Build details HTML
  if (movementDetails) {
    movementDetails.innerHTML = '';
    
    if (movementData.changes.length === 0) {
      movementDetails.innerHTML = '<p style="color: #8a9aaa; font-size: 0.73rem; padding: 8px;">No buildings moved</p>';
      if (expandBtn) expandBtn.style.display = 'none';
    } else {
      movementData.changes.forEach(change => {
        const changeEl = document.createElement('div');
        changeEl.className = 'building-change';
        changeEl.innerHTML = `
          <div class="building-change-name">${escapeHtml(change.name)}</div>
          <div class="building-change-cat">${change.type}</div>
          <div class="building-change-coords">(${change.originalX}, ${change.originalY}) → (${change.newX}, ${change.newY})</div>
          <div class="building-change-distance">Distance: ${change.distance.toFixed(1)} cells</div>
        `;
        movementDetails.appendChild(changeEl);
      });
    }
  }
  
  // Set up expand button
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      expandBtn.classList.toggle('expanded');
      movementDetails?.classList.toggle('expanded');
      
      const text = expandBtn.querySelector('#expand-text');
      if (text) {
        text.textContent = expandBtn.classList.contains('expanded') ? 'Hide changes' : 'Show changes';
      }
    });
  }
}

/**
 * Show the metrics panel
 */
function showMetricsPanel() {
  const panel = document.getElementById('metrics-panel');
  if (panel) {
    panel.style.display = 'block';
  }
}

/**
 * Hide the metrics panel
 */
function hideMetricsPanel() {
  const panel = document.getElementById('metrics-panel');
  if (panel) {
    panel.style.display = 'none';
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Initialize the metrics panel display
 * Call this after optimization completes with the before/after data
 */
function initializeMetricsPanel(originalBuildings, redesignedBuildings, optimizationMetrics) {
  // Display metrics comparison
  renderMetricsComparison(optimizationMetrics);
  
  // Build and display movement information
  const movementData = buildMovementChangelog(originalBuildings, redesignedBuildings);
  displayMovementInfo(movementData);
  
  // Show the metrics panel
  showMetricsPanel();
}
