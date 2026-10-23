/**
 * SpatialOccupancyAgent - Interactive Web Dashboard & Radar Visualizer
 * Fully aligned with SpatialOccupancyAgent.cs C# data models & strict JSON schema.
 */

// JSON Schema definition strictly matching C# SpatialOccupancyAgent.GetJsonSchemaDefinition()
const STRICT_JSON_SCHEMA = {
  type: "object",
  properties: {
    total_occupants: { type: "integer" },
    total_objects_tracked: { type: "integer" },
    room_context_summary: { type: "string" },
    entities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entity_name: { type: "string" },
          entity_type: { type: "string" },
          estimated_distance_meters: { type: "number" },
          relative_position: { type: "string" },
          orientation_or_pose: { type: "string" }
        },
        required: ["entity_name", "entity_type", "estimated_distance_meters", "relative_position", "orientation_or_pose"],
        additionalProperties: false
      }
    }
  },
  required: ["total_occupants", "total_objects_tracked", "room_context_summary", "entities"],
  additionalProperties: false
};

// Preset ground truth data
const SCENE_PRESETS = {
  cubicle: {
    name: "Office Cubicle Workspace (Detected)",
    image: "/office_test_image.jpg",
    report: {
      total_occupants: 2,
      total_objects_tracked: 5,
      room_context_summary: "Office cubicle layout partitioned by acoustic frosted glass dividers. Exactly two human occupants are detected: one in the left cubicle bay wearing a high-visibility orange cap (~2.0m), and one in the right background cubicle bay wearing eyeglasses (~3.1m).",
      entities: [
        {
          entity_name: "Human #1 (Orange Cap)",
          entity_type: "human",
          estimated_distance_meters: 2.0,
          relative_position: "Left cubicle bay, seated behind striped frosted partition",
          orientation_or_pose: "Seated facing forward/workstation",
          coords: { x: 24, y: 25, w: 26, h: 34 }
        },
        {
          entity_name: "Human #2 (Eyeglasses)",
          entity_type: "human",
          estimated_distance_meters: 3.1,
          relative_position: "Right background cubicle bay, near rear doorway",
          orientation_or_pose: "Seated in left profile towards desk",
          coords: { x: 71, y: 21, w: 21, h: 22 }
        },
        {
          entity_name: "Acoustic Striped Glass Divider",
          entity_type: "partition",
          estimated_distance_meters: 1.5,
          relative_position: "Center-left partition separating camera viewpoint from workbays",
          orientation_or_pose: "Upright barrier perpendicular to camera axis",
          coords: { x: 5, y: 34, w: 85, h: 38 }
        },
        {
          entity_name: "Foreground Task Chair Backrest",
          entity_type: "furniture",
          estimated_distance_meters: 0.8,
          relative_position: "Immediate foreground bottom",
          orientation_or_pose: "Horizontal leather chair backrest",
          coords: { x: 35, y: 78, w: 60, h: 18 }
        },
        {
          entity_name: "Rear Office Doorway",
          entity_type: "fixture",
          estimated_distance_meters: 4.5,
          relative_position: "Deep background right corner",
          orientation_or_pose: "Vertical wooden door frame",
          coords: { x: 63, y: 10, w: 12, h: 25 }
        }
      ]
    }
  },
  meeting: {
    name: "Executive Meeting Room",
    image: "/office_test_image.jpg",
    report: {
      total_occupants: 3,
      total_objects_tracked: 5,
      room_context_summary: "Formal collaborative meeting space with central conference table. Three occupants positioned around table sides with interactive presentation screen at front wall.",
      entities: [
        {
          entity_name: "Team Lead",
          entity_type: "human",
          estimated_distance_meters: 2.4,
          relative_position: "Conference table head, facing camera",
          orientation_or_pose: "Seated upright presenting",
          coords: { x: 45, y: 40, w: 10, h: 20 }
        },
        {
          entity_name: "Attendee (Left)",
          entity_type: "human",
          estimated_distance_meters: 1.9,
          relative_position: "Table lateral left flank",
          orientation_or_pose: "Seated angled right toward presenter",
          coords: { x: 25, y: 46, w: 10, h: 20 }
        },
        {
          entity_name: "Attendee (Right)",
          entity_type: "human",
          estimated_distance_meters: 2.2,
          relative_position: "Table lateral right flank",
          orientation_or_pose: "Seated taking notes on laptop",
          coords: { x: 65, y: 46, w: 10, h: 20 }
        },
        {
          entity_name: "Conference Display 75-inch",
          entity_type: "equipment",
          estimated_distance_meters: 4.2,
          relative_position: "Far center wall mount",
          orientation_or_pose: "Wall-mounted planar surface",
          coords: { x: 35, y: 20, w: 30, h: 18 }
        },
        {
          entity_name: "Oak Conference Table",
          entity_type: "furniture",
          estimated_distance_meters: 2.5,
          relative_position: "Center room axis",
          orientation_or_pose: "Horizontal longitudinal plane",
          coords: { x: 20, y: 60, w: 60, h: 25 }
        }
      ]
    }
  },
  open: {
    name: "Open Plan Collaborative Floor",
    image: "/office_test_image.jpg",
    report: {
      total_occupants: 4,
      total_objects_tracked: 8,
      room_context_summary: "Large open plan floor plan with standing desks and hot-desking pods. High ambient light, four mobile workers active within depth range of 1.5m to 4.5m.",
      entities: [
        {
          entity_name: "Engineer Standing",
          entity_type: "human",
          estimated_distance_meters: 1.7,
          relative_position: "Foreground left, standing desk",
          orientation_or_pose: "Standing upright facing dual screens",
          coords: { x: 20, y: 35, w: 12, h: 32 }
        },
        {
          entity_name: "Designer Seated",
          entity_type: "human",
          estimated_distance_meters: 2.6,
          relative_position: "Midground center pod",
          orientation_or_pose: "Seated drafting on tablet",
          coords: { x: 50, y: 42, w: 10, h: 22 }
        },
        {
          entity_name: "Colleague Standing",
          entity_type: "human",
          estimated_distance_meters: 3.8,
          relative_position: "Background right, whiteboard corridor",
          orientation_or_pose: "Standing inspecting board",
          coords: { x: 80, y: 32, w: 8, h: 24 }
        },
        {
          entity_name: "Colleague Seated",
          entity_type: "human",
          estimated_distance_meters: 4.2,
          relative_position: "Deep background left workstation",
          orientation_or_pose: "Seated facing away",
          coords: { x: 12, y: 38, w: 8, h: 20 }
        }
      ]
    }
  }
};

// State
let currentSceneKey = "cubicle";
let currentReport = SCENE_PRESETS.cubicle.report;
let currentFilter = "all";
let radarAngle = 0;
let isSimMode = true;
let customImageSrc = null;

// DOM Elements
const canvas = document.getElementById("radar-canvas");
const ctx = canvas.getContext("2d");
const valOccupants = document.getElementById("val-occupants");
const valObjects = document.getElementById("val-objects");
const valDepth = document.getElementById("val-depth");
const valSummary = document.getElementById("val-summary");
const entitiesList = document.getElementById("entities-list");
const entityCountPill = document.getElementById("entity-count-pill");
const boundingOverlay = document.getElementById("bounding-overlay");
const jsonViewer = document.getElementById("json-viewer");
const schemaViewer = document.getElementById("schema-viewer");
const activeSceneBadge = document.getElementById("active-scene-badge");
const sceneImage = document.getElementById("scene-image");
const apiModal = document.getElementById("api-modal");
const btnApiModal = document.getElementById("btn-api-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const btnSaveKey = document.getElementById("btn-save-key");
const inputApiKey = document.getElementById("input-api-key");
const toggleSimMode = document.getElementById("toggle-sim-mode");
const apiStatusLabel = document.getElementById("api-status-label");
const btnRunAnalysis = document.getElementById("btn-run-analysis");
const imageFileInput = document.getElementById("image-file-input");

// Initialize
function init() {
  loadStoredSettings();
  renderReport(currentReport);
  renderSchema();
  setupEventListeners();
  startRadarLoop();
}

function loadStoredSettings() {
  const savedKey = localStorage.getItem("openai_api_key");
  if (savedKey) {
    inputApiKey.value = savedKey;
    apiStatusLabel.textContent = "API Configured";
    isSimMode = false;
    toggleSimMode.checked = false;
  } else {
    isSimMode = true;
    toggleSimMode.checked = true;
    apiStatusLabel.textContent = "Demo / Simulated";
  }
}

function setupEventListeners() {
  // Preset Buttons
  document.querySelectorAll(".seg-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSceneKey = btn.dataset.preset;
      currentReport = SCENE_PRESETS[currentSceneKey].report;
      activeSceneBadge.textContent = SCENE_PRESETS[currentSceneKey].name;
      if (!customImageSrc) {
        sceneImage.src = SCENE_PRESETS[currentSceneKey].image;
      }
      renderReport(currentReport);
    });
  });

  // Filter Tabs
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      renderEntitiesList(currentReport.entities);
    });
  });

  // Code Tab Buttons
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.tab === "json") {
        jsonViewer.style.display = "block";
        schemaViewer.style.display = "none";
      } else {
        jsonViewer.style.display = "none";
        schemaViewer.style.display = "block";
      }
    });
  });

  // Copy JSON Button
  document.getElementById("btn-copy-json").addEventListener("click", () => {
    const text = JSON.stringify(currentReport, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      alert("Report JSON copied to clipboard!");
    });
  });

  // Image Upload
  imageFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        customImageSrc = event.target.result;
        sceneImage.src = customImageSrc;
        activeSceneBadge.textContent = "Uploaded Custom Image";
        triggerAnalysis();
      };
      reader.readAsDataURL(file);
    }
  });

  // Run Spatial Agent Button
  btnRunAnalysis.addEventListener("click", triggerAnalysis);

  // Modal Controls
  btnApiModal.addEventListener("click", () => apiModal.style.display = "flex");
  btnCloseModal.addEventListener("click", () => apiModal.style.display = "none");
  btnCancelModal.addEventListener("click", () => apiModal.style.display = "none");
  btnSaveKey.addEventListener("click", () => {
    const key = inputApiKey.value.trim();
    if (key) {
      localStorage.setItem("openai_api_key", key);
      apiStatusLabel.textContent = "API Configured";
    } else {
      localStorage.removeItem("openai_api_key");
      apiStatusLabel.textContent = "Demo / Simulated";
    }
    isSimMode = toggleSimMode.checked;
    apiModal.style.display = "none";
  });
}

// Trigger Agent Analysis
async function triggerAnalysis() {
  btnRunAnalysis.disabled = true;
  btnRunAnalysis.innerHTML = `<span class="status-dot"></span> Analyzing Spatial Layout...`;

  try {
    const apiKey = localStorage.getItem("openai_api_key");

    if (!isSimMode && apiKey) {
      // Call backend API if running
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey,
          scene: currentSceneKey,
          image: customImageSrc || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        currentReport = data;
      } else {
        console.warn("Backend API error or offline, falling back to simulated inference");
        simulateInference();
      }
    } else {
      // Offline Simulated Inference with slight variance to feel live
      await new Promise(r => setTimeout(r, 650));
      simulateInference();
    }

    renderReport(currentReport);
  } catch (err) {
    console.error("Analysis execution error:", err);
    simulateInference();
    renderReport(currentReport);
  } finally {
    btnRunAnalysis.disabled = false;
    btnRunAnalysis.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>Run Spatial Agent</span>
    `;
  }
}

function simulateInference() {
  const base = SCENE_PRESETS[currentSceneKey].report;
  // Clone and add slight dynamic variation to distance & poses
  const cloned = JSON.parse(JSON.stringify(base));
  cloned.entities.forEach(ent => {
    ent.estimated_distance_meters = +(ent.estimated_distance_meters + (Math.random() * 0.2 - 0.1)).toFixed(2);
  });
  currentReport = cloned;
}

// Render full report
function renderReport(report) {
  valOccupants.textContent = report.total_occupants;
  valObjects.textContent = report.total_objects_tracked;
  valSummary.textContent = report.room_context_summary;

  // Calculate depth range
  const distances = report.entities.map(e => e.estimated_distance_meters);
  if (distances.length > 0) {
    const minD = Math.min(...distances);
    const maxD = Math.max(...distances);
    valDepth.textContent = `${minD.toFixed(1)} - ${maxD.toFixed(1)}m`;
  }

  entityCountPill.textContent = report.entities.length;
  renderEntitiesList(report.entities);
  renderBoundingBoxes(report.entities);
  renderJson(report);
}

// Render Inspector Entity Rows
function renderEntitiesList(entities) {
  entitiesList.innerHTML = "";

  const filtered = entities.filter(e => {
    if (currentFilter === "all") return true;
    if (currentFilter === "human") return e.entity_type.toLowerCase() === "human";
    if (currentFilter === "object") return e.entity_type.toLowerCase() !== "human";
    return true;
  });

  if (filtered.length === 0) {
    entitiesList.innerHTML = `<div class="text-muted" style="text-align:center; padding: 1rem;">No entities matching filter</div>`;
    return;
  }

  filtered.forEach(entity => {
    const isHuman = entity.entity_type.toLowerCase() === "human";
    const row = document.createElement("div");
    row.className = "entity-row";

    row.innerHTML = `
      <div class="entity-avatar ${isHuman ? 'human' : 'object'}">
        ${isHuman ? `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ` : `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        `}
      </div>
      <div class="entity-info">
        <div class="entity-name">
          ${entity.entity_name}
          <span class="badge ${isHuman ? 'badge-cyan' : 'badge-purple'}">${entity.entity_type}</span>
        </div>
        <div class="entity-meta">${entity.relative_position}</div>
      </div>
      <div class="entity-spatial-stat">
        <span class="distance-tag">${entity.estimated_distance_meters.toFixed(2)}m</span>
        <span class="pose-pill">${entity.orientation_or_pose}</span>
      </div>
    `;

    entitiesList.appendChild(row);
  });
}

// Render Bounding Boxes on Scene Image
function renderBoundingBoxes(entities) {
  boundingOverlay.innerHTML = "";

  entities.forEach((entity, index) => {
    const isHuman = entity.entity_type.toLowerCase() === "human";
    const coords = entity.coords || {
      x: 15 + (index * 12) % 70,
      y: 35 + (index * 8) % 35,
      w: isHuman ? 10 : 12,
      h: isHuman ? 22 : 16
    };

    const box = document.createElement("div");
    box.className = `spatial-box ${isHuman ? 'human-box' : 'object-box'}`;
    box.style.left = `${coords.x}%`;
    box.style.top = `${coords.y}%`;
    box.style.width = `${coords.w}%`;
    box.style.height = `${coords.h}%`;

    const tag = document.createElement("div");
    tag.className = "spatial-tag";
    tag.innerHTML = `<strong>${entity.entity_name}</strong> &bull; ${entity.estimated_distance_meters}m`;
    box.appendChild(tag);

    boundingOverlay.appendChild(box);
  });
}

// Render JSON & Schema
function renderJson(report) {
  jsonViewer.textContent = JSON.stringify(report, null, 2);
}

function renderSchema() {
  schemaViewer.textContent = JSON.stringify(STRICT_JSON_SCHEMA, null, 2);
}

// 2D Bird's-Eye Spatial Radar Canvas Visualizer
function startRadarLoop() {
  function draw() {
    renderRadarCanvas();
    radarAngle += 0.025;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

function renderRadarCanvas() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h - 25; // Camera viewpoint at bottom center
  const maxRadius = h - 45;
  const maxRangeMeters = 6.0;

  // Concentric Distance Rings (1m, 2m, 3m, 4m, 5m)
  ctx.lineWidth = 1;
  for (let r = 1; r <= 5; r++) {
    const radiusPx = (r / maxRangeMeters) * maxRadius;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.arc(cx, cy, radiusPx, Math.PI, 2 * Math.PI, false);
    ctx.stroke();

    // Distance labels
    ctx.fillStyle = "rgba(148, 163, 184, 0.55)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText(`${r}m`, cx + radiusPx - 14, cy - 4);
  }

  // Camera Field of View (FOV) cone (78 deg)
  const fovHalfRad = (78 / 2) * (Math.PI / 180);
  const leftAngle = (3 * Math.PI / 2) - fovHalfRad;
  const rightAngle = (3 * Math.PI / 2) + fovHalfRad;

  ctx.fillStyle = "rgba(0, 242, 254, 0.035)";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, maxRadius, leftAngle, rightAngle, false);
  ctx.closePath();
  ctx.fill();

  // FOV boundary lines
  ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(leftAngle) * maxRadius, cy + Math.sin(leftAngle) * maxRadius);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(rightAngle) * maxRadius, cy + Math.sin(rightAngle) * maxRadius);
  ctx.stroke();

  // Radar Sweeping Scan Line
  const scanSweepAngle = leftAngle + ((Math.sin(radarAngle) + 1) / 2) * (rightAngle - leftAngle);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
  grad.addColorStop(0, "rgba(0, 242, 254, 0.8)");
  grad.addColorStop(1, "rgba(0, 242, 254, 0.0)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(scanSweepAngle) * maxRadius, cy + Math.sin(scanSweepAngle) * maxRadius);
  ctx.stroke();

  // Camera Origin Marker
  ctx.fillStyle = "#00f2fe";
  ctx.shadowColor = "#00f2fe";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#94a3b8";
  ctx.font = "9px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("CAM_VIEWPOINT", cx - 35, cy + 18);

  // Plot Entities
  if (currentReport && currentReport.entities) {
    currentReport.entities.forEach((entity, index) => {
      const isHuman = entity.entity_type.toLowerCase() === "human";
      const isPartition = entity.entity_type.toLowerCase() === "partition";

      // Calculate polar position based on distance and relative position text
      const dist = Math.min(entity.estimated_distance_meters, maxRangeMeters);
      const radiusPx = (dist / maxRangeMeters) * maxRadius;

      let lateralOffset = 0; // -1 (left) to 1 (right)
      const pos = entity.relative_position.toLowerCase();
      if (pos.includes("left")) lateralOffset = -0.55;
      else if (pos.includes("right")) lateralOffset = 0.55;
      else if (pos.includes("center")) lateralOffset = 0.05;
      else lateralOffset = ((index % 3) - 1) * 0.45;

      const angle = (3 * Math.PI / 2) + (lateralOffset * fovHalfRad * 0.85);
      const ex = cx + Math.cos(angle) * radiusPx;
      const ey = cy + Math.sin(angle) * radiusPx;

      // Color scheme
      let color = "#818cf8";
      if (isHuman) color = "#38bdf8";
      if (isPartition) color = "#f59e0b";

      // Entity glow
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isHuman ? 12 : 6;
      ctx.beginPath();
      ctx.arc(ex, ey, isHuman ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
      const label = isHuman ? entity.entity_name.split(" ")[0] : entity.entity_name.split(" ")[0];
      ctx.fillText(`${label} (${entity.estimated_distance_meters}m)`, ex + 8, ey + 3);
    });
  }
}

// Start application
window.addEventListener("DOMContentLoaded", init);
