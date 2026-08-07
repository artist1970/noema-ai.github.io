import { statusLabel } from "../research/fact-status.js";
import { SketchCanvas } from "../avatars/sketch-canvas.js";
import { refineSketch } from "../avatars/sketch-refiner.js";
import { renderAvatarSVG } from "../avatars/avatar-renderer.js";
import { speakMentorText } from "../avatars/voice-profile.js";
import { PRIMARY_TEMPERAMENTS, MENTOR_TRAITS, COLLABORATION_STYLES, getTemperament } from "../avatars/personality-catalog.js";
import { HAIR_STYLES, HAIR_COLORS, EYE_COLORS, SKIN_TONES, OUTFIT_STYLES, ACCENT_COLORS } from "../avatars/appearance-catalog.js";
import { NoemaCore } from "../core/noema-core.js";
import { listModes, getMode } from "../core/mode-router.js";
import { LocalPlaceholderProvider } from "../providers/local-placeholder.js";

const provider = new LocalPlaceholderProvider();
const noema = new NoemaCore({ role: "adult", provider });

const modesEl = document.querySelector("#modes");
const hintEl = document.querySelector("#modeHint");
const modulesEl = document.querySelector("#modules");
const messageEl = document.querySelector("#message");
const responseEl = document.querySelector("#response");
const routeBtn = document.querySelector("#routeBtn");
const clearBtn = document.querySelector("#clearBtn");
const eraseBtn = document.querySelector("#eraseBtn");

const verifierBtn = document.querySelector("#verifierBtn");
const verifierDrawer = document.querySelector("#verifierDrawer");
const verifierClose = document.querySelector("#verifierClose");
const verifierForm = document.querySelector("#verifierForm");
const verifierClaim = document.querySelector("#verifierClaim");
const verifierDomain = document.querySelector("#verifierDomain");
const verifierLanes = document.querySelector("#verifierLanes");
const verifierTasks = document.querySelector("#verifierTasks");
const verifierEvidence = document.querySelector("#verifierEvidence");
const verifierVerdict = document.querySelector("#verifierVerdict");
const verifierDomainLabel = document.querySelector("#verifierDomainLabel");
const metricSources = document.querySelector("#metricSources");
const metricFamilies = document.querySelector("#metricFamilies");
const metricPrimary = document.querySelector("#metricPrimary");
const metricMissing = document.querySelector("#metricMissing");
const verifierWarning = document.querySelector("#verifierWarning");
const verifierStatus = document.querySelector("#verifierStatus");
const freshnessVerifiedBtn = document.querySelector("#freshnessVerifiedBtn");
const saveVerificationBtn = document.querySelector("#saveVerificationBtn");
const addEvidenceBtn = document.querySelector("#addEvidenceBtn");
const evidenceTitle = document.querySelector("#evidenceTitle");
const evidenceOrganization = document.querySelector("#evidenceOrganization");
const evidenceUrl = document.querySelector("#evidenceUrl");
const evidenceLevel = document.querySelector("#evidenceLevel");
const evidenceRelation = document.querySelector("#evidenceRelation");
const evidenceFamily = document.querySelector("#evidenceFamily");
const evidenceRegion = document.querySelector("#evidenceRegion");
const evidenceConfidence = document.querySelector("#evidenceConfidence");
const evidenceDate = document.querySelector("#evidenceDate");
const evidenceNotes = document.querySelector("#evidenceNotes");

let activeVerification = null;

const avatarBtn = document.querySelector("#avatarBtn");
const avatarDrawer = document.querySelector("#avatarDrawer");
const avatarClose = document.querySelector("#avatarClose");
const avatarForm = document.querySelector("#avatarForm");
const avatarName = document.querySelector("#avatarName");
const partsTab = document.querySelector("#partsTab");
const drawTab = document.querySelector("#drawTab");
const partsPanel = document.querySelector("#partsPanel");
const drawPanel = document.querySelector("#drawPanel");
const avatarHairStyle = document.querySelector("#avatarHairStyle");
const avatarOutfitStyle = document.querySelector("#avatarOutfitStyle");
const avatarSkinTones = document.querySelector("#avatarSkinTones");
const avatarHairColors = document.querySelector("#avatarHairColors");
const avatarEyeColors = document.querySelector("#avatarEyeColors");
const avatarPrimaryColor = document.querySelector("#avatarPrimaryColor");
const avatarSecondaryColor = document.querySelector("#avatarSecondaryColor");
const avatarTemperament = document.querySelector("#avatarTemperament");
const avatarTraits = document.querySelector("#avatarTraits");
const avatarInterests = document.querySelector("#avatarInterests");
const avatarCollaboration = document.querySelector("#avatarCollaboration");
const avatarVoiceStyle = document.querySelector("#avatarVoiceStyle");
const avatarVoiceRate = document.querySelector("#avatarVoiceRate");
const avatarVoicePitch = document.querySelector("#avatarVoicePitch");
const avatarBrowserVoice = document.querySelector("#avatarBrowserVoice");
const saveAvatarDraftBtn = document.querySelector("#saveAvatarDraftBtn");
const hearMentorBtn = document.querySelector("#hearMentorBtn");
const avatarStatus = document.querySelector("#avatarStatus");
const avatarPreview = document.querySelector("#avatarPreview");
const avatarPreviewName = document.querySelector("#avatarPreviewName");
const avatarPreviewDescription = document.querySelector("#avatarPreviewDescription");
const avatarAdoptionBadge = document.querySelector("#avatarAdoptionBadge");

const sketchGuide = document.querySelector("#sketchGuide");
const sketchGuideStep = document.querySelector("#sketchGuideStep");
const sketchBrushSize = document.querySelector("#sketchBrushSize");
const sketchOpacity = document.querySelector("#sketchOpacity");
const sketchColor = document.querySelector("#sketchColor");
const sketchCleanup = document.querySelector("#sketchCleanup");
const sketchEraser = document.querySelector("#sketchEraser");
const sketchSymmetry = document.querySelector("#sketchSymmetry");
const sketchUndo = document.querySelector("#sketchUndo");
const sketchRedo = document.querySelector("#sketchRedo");
const sketchClear = document.querySelector("#sketchClear");
const sketchRefine = document.querySelector("#sketchRefine");
const sketchSave = document.querySelector("#sketchSave");
const originalPreviewCanvas = document.querySelector("#originalPreviewCanvas");
const refinedPreviewCanvas = document.querySelector("#refinedPreviewCanvas");

let avatarCreationMode = "parts";
let selectedSkinTone = "tone-04";
let selectedHairColor = "brown";
let selectedEyeColor = "brown";
let refinedSketchStrokes = [];

const enrollmentBtn = document.querySelector("#enrollmentBtn");
const enrollmentDrawer = document.querySelector("#enrollmentDrawer");
const enrollmentClose = document.querySelector("#enrollmentClose");
const enrollmentForm = document.querySelector("#enrollmentForm");
const enrollDisplayName = document.querySelector("#enrollDisplayName");
const enrollBirthMonth = document.querySelector("#enrollBirthMonth");
const enrollBirthYear = document.querySelector("#enrollBirthYear");
const enrollEducationSetting = document.querySelector("#enrollEducationSetting");
const enrollGrade = document.querySelector("#enrollGrade");
const enrollLearningStage = document.querySelector("#enrollLearningStage");
const enrollFavoriteSubject = document.querySelector("#enrollFavoriteSubject");
const enrollInterests = document.querySelector("#enrollInterests");
const enrollmentMessage = document.querySelector("#enrollmentMessage");
const identitySummary = document.querySelector("#identitySummary");
const serverStatusPill = document.querySelector("#serverStatusPill");

const memoryBtn = document.querySelector("#memoryBtn");
const memoryDrawer = document.querySelector("#memoryDrawer");
const memoryClose = document.querySelector("#memoryClose");
const memoryList = document.querySelector("#memoryList");
const memoryCount = document.querySelector("#memoryCount");
const memoryForm = document.querySelector("#memoryForm");
const memoryTitle = document.querySelector("#memoryTitle");
const memoryContent = document.querySelector("#memoryContent");
const memoryKind = document.querySelector("#memoryKind");
const memoryScope = document.querySelector("#memoryScope");
const memoryTags = document.querySelector("#memoryTags");
const memoryStatus = document.querySelector("#memoryStatus");
const exportMemoryBtn = document.querySelector("#exportMemoryBtn");

const projectForm = document.querySelector("#projectForm");
const projectTitle = document.querySelector("#projectTitle");
const projectSummary = document.querySelector("#projectSummary");
const projectMode = document.querySelector("#projectMode");
const projectList = document.querySelector("#projectList");
const activeProjectLabel = document.querySelector("#activeProjectLabel");

let activeMode = noema.preferences.load().preferences.lastMode || "personal";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function renderModes() {
  modesEl.innerHTML = "";
  for (const mode of listModes()) {
    const button = document.createElement("button");
    button.className = `mode${mode.id === activeMode ? " active" : ""}`;
    button.textContent = mode.label;
    button.addEventListener("click", () => {
      activeMode = mode.id;
      noema.preferences.patch({ lastMode: activeMode });
      renderModes();
      renderMode(activeMode);
    });
    modesEl.appendChild(button);
  }
}

function renderMode(id) {
  hintEl.textContent = getMode(id).hint;
}

function renderModules(route) {
  const activeProject = route.context?.project;
  const memoryUsed = route.context?.memory?.relevant || [];

  const contextCard = `
    <article class="card module-card context-card">
      <div class="module-title">Active Context</div>
      <div class="module-purpose">
        ${activeProject
          ? `Project: <strong>${escapeHtml(activeProject.title)}</strong>`
          : "No active project"}
        <br>
        Memory: ${memoryUsed.length} relevant of ${route.context?.memory?.activeCount || 0} retained
      </div>
    </article>
  `;

  const verifierCard = `
    <article class="card module-card verifier-context-card">
      <div class="module-title">The Verifier Agent</div>
      <div class="module-purpose">
        Research claims use evidence status, provenance, independent corroboration and contradiction checks before a verified-fact label.
      </div>
    </article>
  `;

  const avatar = route.context?.avatar;
  const avatarCard = `
    <article class="card module-card avatar-context-card">
      <div class="module-title">Adopted Mentor</div>
      <div class="module-purpose">
        ${avatar
          ? `${escapeHtml(avatar.displayName)} · ${escapeHtml(avatar.temperament)} · ${escapeHtml(avatar.status)}`
          : "No mentor adopted yet"}
      </div>
    </article>
  `;

  const enrollment = route.context?.enrollment;
  const enrollmentCard = `
    <article class="card module-card enrollment-status-card">
      <div class="module-title">Identity & Enrollment</div>
      <div class="module-purpose">
        ${enrollment
          ? `${escapeHtml(enrollment.displayName)} · ${escapeHtml(enrollment.ageBand)}<br>${escapeHtml(enrollment.learning?.gradeLevel || "not-applicable")}`
          : "No local enrollment profile yet"}
      </div>
    </article>
  `;

  const integrity = `
    <article class="card module-card system-integrity">
      <div class="module-title">NOEMA Constitution</div>
      <div class="module-purpose">
        Ethics kernel active · v${escapeHtml(route.ethics.constitutionVersion)}
      </div>
      <div class="integrity-row">
        <span class="integrity-dot ${route.ethics.blocked ? "blocked" : "active"}"></span>
        ${route.ethics.blocked ? "Boundary enforced" : "Active"}
      </div>
    </article>
  `;

  const specialists = route.modules.map(module => `
    <article class="card module-card">
      <div class="module-title">${escapeHtml(module.label)}</div>
      <div class="module-purpose">${escapeHtml(module.purpose)}</div>
      ${module.url
        ? `<a class="module-link" target="_blank" rel="noopener" href="${module.url}">Open specialist module ↗</a>`
        : ""
      }
    </article>
  `).join("");

  modulesEl.innerHTML = verifierCard + avatarCard + enrollmentCard + contextCard + integrity + specialists;
}

async function handleRoute() {
  const route = noema.route(messageEl.value, { mode: activeMode });
  renderModules(route);

  const result = await provider.respond({ route });

  const safety = route.safety.highStakes
    ? `<div class="notice"><strong>Care boundary:</strong> This request may involve ${route.safety.categories.join(", ")} information. Current or qualified sources may be required.</div>`
    : "";

  const privacy = route.privacy.sensitive
    ? `<div class="notice"><strong>Privacy:</strong> ${escapeHtml(route.privacy.recommendation)}</div>`
    : "";

  const ethics = route.ethics.needsReview
    ? `<div class="notice constitution-notice"><strong>Constitution:</strong> ${route.ethics.concerns.map(item => escapeHtml(item.message)).join(" ")}</div>`
    : "";

  const recalled = route.context?.memory?.relevant?.length
    ? `<div class="memory-context-note">Context used: ${route.context.memory.relevant.length} explicitly retained memory item${route.context.memory.relevant.length === 1 ? "" : "s"}.</div>`
    : "";

  responseEl.innerHTML = `
    ${safety}
    ${privacy}
    ${ethics}
    <strong>${escapeHtml(result.text)}</strong>
    ${recalled}
    <div class="meta">
      Provider: ${escapeHtml(result.provider)}
      · Model-generated response: ${result.generatedByModel ? "yes" : "no"}
      · Constitution: active v${escapeHtml(route.ethics.constitutionVersion)}
    </div>
  `;

  if (!route.ethics.blocked) {
    noema.rememberExchange({
      user: route.message,
      assistant: result.text,
      mode: route.mode.id
    });
  }
}



function optionize(items, selected="") {
  return items.map(item => {
    const id = typeof item === "string" ? item : item.id;
    const label = typeof item === "string"
      ? item.replaceAll("-", " ").replace(/\b\w/g, c => c.toUpperCase())
      : item.label || item.id;
    return `<option value="${escapeHtml(id)}"${id===selected?" selected":""}>${escapeHtml(label)}</option>`;
  }).join("");
}

function renderSwatches(el, items, selected, onSelect) {
  el.innerHTML = items.map(item => `
    <button type="button" class="swatch" data-id="${escapeHtml(item.id)}"
      aria-label="${escapeHtml(item.label || item.id)}"
      aria-pressed="${item.id===selected?"true":"false"}"
      style="background:${item.value}"></button>
  `).join("");
  el.querySelectorAll(".swatch").forEach(button => {
    button.addEventListener("click", () => {
      onSelect(button.dataset.id);
      renderAvatarPreview();
    });
  });
}

function checkedValues(container, max=4) {
  return [...container.querySelectorAll('input[type="checkbox"]:checked')]
    .map(input=>input.value).slice(0,max);
}

function fillChoiceGrid(container, items, max=4, childLabel=false) {
  container.innerHTML = items.map(item => {
    const id = typeof item === "string" ? item : item.id;
    const label = typeof item === "string"
      ? item.replaceAll("-", " ").replace(/\b\w/g,c=>c.toUpperCase())
      : (childLabel ? item.childLabel : item.label);
    return `<label class="choice"><input type="checkbox" value="${escapeHtml(id)}"> ${escapeHtml(label)}</label>`;
  }).join("");

  container.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", () => {
      const checked=[...container.querySelectorAll("input:checked")];
      if(checked.length>max){
        input.checked=false;
        avatarStatus.textContent=`Choose up to ${max}.`;
      }
      renderAvatarPreview();
    });
  });
}

function setCreationMode(mode) {
  avatarCreationMode = mode === "sketch" ? "sketch" : "parts";
  partsTab.classList.toggle("active", avatarCreationMode==="parts");
  drawTab.classList.toggle("active", avatarCreationMode==="sketch");
  partsPanel.hidden = avatarCreationMode!=="parts";
  drawPanel.hidden = avatarCreationMode!=="sketch";
  if(avatarCreationMode==="sketch") {
    requestAnimationFrame(()=>sketchPad?.resize());
  }
  renderAvatarPreview();
}

function avatarInput() {
  const existingSketch = noema.avatarFoundry.currentSketch();
  return {
    creationMode: avatarCreationMode,
    displayName: avatarName.value || "My Mentor",
    appearance: {
      hairStyle: avatarHairStyle.value,
      hairColor: selectedHairColor,
      eyeColor: selectedEyeColor,
      skinTone: selectedSkinTone,
      outfitStyle: avatarOutfitStyle.value,
      primaryColor: avatarPrimaryColor.value,
      secondaryColor: avatarSecondaryColor.value
    },
    artSource: {
      sketchId: avatarCreationMode==="sketch" ? existingSketch?.sketchId || null : null,
      refinementStatus: avatarCreationMode==="sketch"
        ? (refinedSketchStrokes.length ? "local-cleanup" : "source-only")
        : "not-applicable"
    },
    temperament: avatarTemperament.value,
    traits: checkedValues(avatarTraits,4),
    collaboration: checkedValues(avatarCollaboration,4),
    sharedInterests: checkedValues(avatarInterests,8),
    voice: {
      style: avatarVoiceStyle.value,
      rate: Number(avatarVoiceRate.value),
      pitch: Number(avatarVoicePitch.value),
      browserVoiceURI: avatarBrowserVoice.value
    }
  };
}

function drawStrokeSet(canvas, strokes) {
  const ctx=canvas.getContext("2d");
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#fffdf8";ctx.fillRect(0,0,w,h);
  if(!strokes?.length) return;

  const sourceW=sketchPad?.logicalWidth||600;
  const sourceH=sketchPad?.logicalHeight||520;
  const sx=w/sourceW, sy=h/sourceH;
  ctx.save();ctx.scale(sx,sy);

  for(const stroke of strokes){
    const pts=stroke.points||[];if(!pts.length)continue;
    ctx.save();
    ctx.globalAlpha=stroke.opacity??1;
    ctx.lineWidth=stroke.width||4;
    ctx.lineCap="round";ctx.lineJoin="round";
    ctx.strokeStyle=stroke.color||"#17243a";
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
    for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);
    ctx.stroke();ctx.restore();
  }
  ctx.restore();
}

function cleanupOptions() {
  const mode=sketchCleanup.value;
  if(mode==="gentle") return {smoothRadius:1,curveIterations:1,simplifyTolerance:.8};
  if(mode==="polished") return {smoothRadius:3,curveIterations:3,simplifyTolerance:1.7,uniformWidth:false};
  return {smoothRadius:2,curveIterations:2,simplifyTolerance:1.15};
}

function refineCurrentSketch() {
  refinedSketchStrokes = refineSketch(sketchPad.strokes, cleanupOptions());
  drawStrokeSet(originalPreviewCanvas, sketchPad.strokes);
  drawStrokeSet(refinedPreviewCanvas, refinedSketchStrokes);
  avatarStatus.textContent = refinedSketchStrokes.length
    ? "Cleaned preview created. Your original drawing is still preserved."
    : "Draw a little more before cleanup.";
}

function saveCurrentSketch() {
  if(!sketchPad?.strokes?.length){
    avatarStatus.textContent="Draw your mentor before saving the sketch.";
    return null;
  }
  if(!refinedSketchStrokes.length) refineCurrentSketch();
  const result=noema.saveAvatarSketch(sketchPad.strokes,{
    width:sketchPad.logicalWidth,
    height:sketchPad.logicalHeight,
    guide:sketchGuide.value,
    symmetry:sketchPad.symmetry,
    refinement:cleanupOptions()
  });
  avatarStatus.textContent=result.reason;
  renderAvatarPreview();
  return result;
}

function renderAvatarPreview() {
  const input=avatarInput();
  const temperament=getTemperament(input.temperament);
  const adopted=noema.getAvatar();

  avatarPreviewName.textContent=input.displayName||"My Mentor";
  avatarAdoptionBadge.textContent=adopted?.status==="adopted" ? "Adopted" : "Designing";

  if(avatarCreationMode==="sketch" && refinedSketchStrokes.length){
    avatarPreview.innerHTML="";
    const canvas=document.createElement("canvas");
    canvas.width=360;canvas.height=320;
    canvas.style.width="100%";canvas.style.maxWidth="360px";
    avatarPreview.appendChild(canvas);
    drawStrokeSet(canvas,refinedSketchStrokes);
  } else {
    const draft=noema.avatarFoundry.draft(input);
    avatarPreview.innerHTML = draft?.mentorId ? renderAvatarSVG(draft,{size:250}) : renderAvatarSVG(input,{size:250});
  }

  const traits=input.traits.length ? input.traits.map(t=>t.replaceAll("-"," ")).join(" · ") : "Choose a few traits";
  avatarPreviewDescription.textContent =
    `${temperament.label} · ${traits}. ${avatarCreationMode==="sketch" ? "Created from your drawing." : "Created from selected features."}`;
}

function populateVoices() {
  if(!("speechSynthesis" in window)) return;
  const current=avatarBrowserVoice.value;
  const voices=speechSynthesis.getVoices()||[];
  avatarBrowserVoice.innerHTML='<option value="">Automatic</option>'+
    voices.map(v=>`<option value="${escapeHtml(v.voiceURI)}">${escapeHtml(v.name)} · ${escapeHtml(v.lang)}</option>`).join("");
  if([...avatarBrowserVoice.options].some(o=>o.value===current)) avatarBrowserVoice.value=current;
}

const sketchPad = new SketchCanvas(
  document.querySelector("#mentorSketchCanvas"),
  {
    guideCanvas: document.querySelector("#mentorGuideCanvas"),
    onChange: strokes => {
      refinedSketchStrokes=[];
      drawStrokeSet(originalPreviewCanvas,strokes);
      drawStrokeSet(refinedPreviewCanvas,[]);
    }
  }
);

function rerenderSkin(){
  renderSwatches(avatarSkinTones,SKIN_TONES,selectedSkinTone,id=>{selectedSkinTone=id;rerenderSkin();renderAvatarPreview()});
}
function rerenderHair(){
  renderSwatches(avatarHairColors,HAIR_COLORS,selectedHairColor,id=>{selectedHairColor=id;rerenderHair();renderAvatarPreview()});
}
function rerenderEyes(){
  renderSwatches(avatarEyeColors,EYE_COLORS,selectedEyeColor,id=>{selectedEyeColor=id;rerenderEyes();renderAvatarPreview()});
}

function hydrateAvatarForm() {
  const current=noema.getAvatar();
  if(!current) return;
  avatarName.value=current.displayName||"";
  setCreationMode(current.creationMode);
  avatarHairStyle.value=current.appearance?.hairStyle||"wavy";
  avatarOutfitStyle.value=current.appearance?.outfitStyle||"classic";
  selectedSkinTone=current.appearance?.skinTone||"tone-04";
  selectedHairColor=current.appearance?.hairColor||"brown";
  selectedEyeColor=current.appearance?.eyeColor||"brown";
  avatarPrimaryColor.value=current.appearance?.primaryColor||"midnight";
  avatarSecondaryColor.value=current.appearance?.secondaryColor||"gold";
  avatarTemperament.value=current.temperament||"curious";
  avatarVoiceStyle.value=current.voice?.style||"warm";
  avatarVoiceRate.value=current.voice?.rate||.95;
  avatarVoicePitch.value=current.voice?.pitch||1;

  const setChecked=(container,vals=[])=>{
    const set=new Set(vals);
    container.querySelectorAll("input").forEach(i=>i.checked=set.has(i.value));
  };
  setChecked(avatarTraits,current.traits);
  setChecked(avatarCollaboration,current.collaboration);
  setChecked(avatarInterests,current.sharedInterests);

  rerenderSkin();rerenderHair();rerenderEyes();

  const sketch=noema.avatarFoundry.currentSketch();
  if(sketch){
    sketchPad.setStrokes(sketch.originalStrokes||[]);
    refinedSketchStrokes=sketch.refinedStrokes||[];
    drawStrokeSet(originalPreviewCanvas,sketch.originalStrokes||[]);
    drawStrokeSet(refinedPreviewCanvas,refinedSketchStrokes);
  }
}


function openVerifier() {
  verifierDrawer.hidden=false;
  renderVerifier();
}
function closeVerifier(){verifierDrawer.hidden=true}

function buildVerifierSession() {
  const result=noema.createVerification(verifierClaim.value,{domain:verifierDomain.value});
  if(!result.ok){verifierStatus.textContent=result.reason;return}
  activeVerification=result.session;
  verifierStatus.textContent="Verification plan created. Complete the evidence lanes before using a verified-fact label.";
  renderVerifier();
}

function renderVerifier() {
  if(!activeVerification){
    verifierLanes.innerHTML='<div class="memory-empty">Create a verification plan to see the required research lanes.</div>';
    verifierTasks.innerHTML='<div class="memory-empty">No active verification session.</div>';
    verifierEvidence.innerHTML='<div class="memory-empty">No evidence added yet.</div>';
    verifierVerdict.textContent="Not yet verified";
    verifierDomainLabel.textContent="Create a verification plan";
    metricSources.textContent="0";metricFamilies.textContent="0";metricPrimary.textContent="0";metricMissing.textContent="—";
    return;
  }

  const summary=noema.verifier.summarize(activeVerification);
  verifierVerdict.textContent=summary.label;
  verifierDomainLabel.textContent=`Domain: ${activeVerification.analysis.domain}`;
  metricSources.textContent=String(summary.sourceCount);
  metricFamilies.textContent=String(summary.independentFamilies);
  metricPrimary.textContent=String(summary.primaryCount);
  metricMissing.textContent=summary.missingRequiredLanes.length ? String(summary.missingRequiredLanes.length) : "0";

  const warnings=[
    ...summary.warnings,
    ...(summary.missingRequiredLanes.length ? [`Required evidence lanes still incomplete: ${summary.missingRequiredLanes.join(", ")}.`] : []),
    ...(!summary.canUseVerifiedLabel ? ["The evidence does not currently satisfy NOEMA's verified-fact gate."] : [])
  ];
  verifierWarning.textContent=warnings.join(" ") ||
    "The evidence currently satisfies the Verifier gate. Keep citations and provenance attached to the final claim.";

  const completed=new Set(activeVerification.completedLaneIds||[]);
  verifierLanes.innerHTML=(activeVerification.plan.lanes||[]).map(lane=>`
    <article class="verifier-lane">
      <strong>${escapeHtml(lane.name)}</strong>
      <small>${escapeHtml(lane.notes)}</small>
      <button type="button" class="mini-btn" data-lane="${escapeHtml(lane.id)}">
        ${completed.has(lane.id) ? "✓ Checked" : "Mark lane checked"}
      </button>
    </article>
  `).join("");

  verifierLanes.querySelectorAll("[data-lane]").forEach(button=>{
    button.addEventListener("click",()=>{
      activeVerification=noema.verifier.completeLane(activeVerification,button.dataset.lane);
      renderVerifier();
    });
  });

  verifierTasks.innerHTML=(activeVerification.tasks||[]).map(task=>`
    <article class="verifier-task">
      <span class="task-state ${escapeHtml(task.status)}">${escapeHtml(task.status)}</span>
      <div><strong>${escapeHtml(task.label)}</strong><small>${escapeHtml(task.purpose)}</small></div>
      <span class="memory-tag">${escapeHtml(task.laneId||"")}</span>
    </article>
  `).join("");

  verifierEvidence.innerHTML=(activeVerification.sources||[]).length
    ? activeVerification.sources.map(source=>`
      <article class="evidence-row">
        <strong>${escapeHtml(source.title)}</strong>
        <div class="meta">${escapeHtml(source.level)} · ${escapeHtml(source.relation)} · ${escapeHtml(source.confidence)} · ${escapeHtml(source.region||source.jurisdiction||"region not recorded")}</div>
        <div style="margin-top:.3rem;font-size:11px;color:#666">${escapeHtml(source.organization||source.publisher||source.sourceFamily)}</div>
        ${source.evidenceNotes?`<div style="margin-top:.35rem;font-size:11px;line-height:1.5">${escapeHtml(source.evidenceNotes)}</div>`:""}
      </article>
    `).join("")
    : '<div class="memory-empty">No evidence added yet.</div>';
}

verifierForm.addEventListener("submit",event=>{event.preventDefault();buildVerifierSession()});

addEvidenceBtn.addEventListener("click",()=>{
  if(!activeVerification){verifierStatus.textContent="Create a verification plan first.";return}
  if(!evidenceTitle.value.trim()){verifierStatus.textContent="Give the source a title.";return}
  activeVerification=noema.verifier.addSource(activeVerification,{
    title:evidenceTitle.value,
    organization:evidenceOrganization.value,
    url:evidenceUrl.value,
    level:evidenceLevel.value,
    relation:evidenceRelation.value,
    independenceFamily:evidenceFamily.value,
    region:evidenceRegion.value,
    confidence:evidenceConfidence.value,
    publicationDate:evidenceDate.value,
    evidenceNotes:evidenceNotes.value
  });
  verifierStatus.textContent="Evidence added and verdict recalculated.";
  evidenceTitle.value="";evidenceOrganization.value="";evidenceUrl.value="";evidenceFamily.value="";evidenceRegion.value="";evidenceNotes.value="";
  renderVerifier();
});

freshnessVerifiedBtn.addEventListener("click",()=>{
  if(!activeVerification){verifierStatus.textContent="Create a verification plan first.";return}
  activeVerification=noema.verifier.setFreshness(activeVerification,true);
  verifierStatus.textContent="Freshness check recorded for this local verification session.";
  renderVerifier();
});

saveVerificationBtn.addEventListener("click",()=>{
  if(!activeVerification){verifierStatus.textContent="There is no verification session to save.";return}
  const result=noema.saveVerification(activeVerification);
  if(result.ok){activeVerification=result.session;verifierStatus.textContent="Verification session saved locally."}
  else verifierStatus.textContent=result.reason;
  renderVerifier();
});

verifierBtn.addEventListener("click",openVerifier);
verifierClose.addEventListener("click",closeVerifier);
verifierDrawer.addEventListener("click",event=>{if(event.target===verifierDrawer)closeVerifier()});


function openAvatarFoundry() {
  const enrollment=noema.getEnrollmentStatus().profile;
  if(!enrollment){
    avatarStatus.textContent="Create an Identity & Enrollment profile first so the mentor has a person to belong to.";
  }
  avatarDrawer.hidden=false;
  populateVoices();
  hydrateAvatarForm();
  requestAnimationFrame(()=>sketchPad.resize());
  renderAvatarPreview();
}
function closeAvatarFoundry(){avatarDrawer.hidden=true}

partsTab.addEventListener("click",()=>setCreationMode("parts"));
drawTab.addEventListener("click",()=>setCreationMode("sketch"));

sketchGuide.addEventListener("change",()=>sketchPad.setGuide(sketchGuide.value));
sketchGuideStep.addEventListener("change",()=>sketchPad.setGuideStep(sketchGuideStep.value));
sketchBrushSize.addEventListener("input",()=>sketchPad.setWidth(sketchBrushSize.value));
sketchOpacity.addEventListener("input",()=>sketchPad.setOpacity(sketchOpacity.value));
sketchColor.addEventListener("input",()=>{sketchPad.setColor(sketchColor.value);sketchEraser.classList.remove("active")});
sketchEraser.addEventListener("click",()=>{
  sketchPad.setEraser(!sketchPad.eraser);
  sketchEraser.classList.toggle("active",sketchPad.eraser);
});
sketchSymmetry.addEventListener("click",()=>{
  sketchPad.setSymmetry(!sketchPad.symmetry);
  sketchSymmetry.classList.toggle("active",sketchPad.symmetry);
});
sketchUndo.addEventListener("click",()=>sketchPad.undo());
sketchRedo.addEventListener("click",()=>sketchPad.redo());
sketchClear.addEventListener("click",()=>{if(confirm("Clear this mentor drawing?"))sketchPad.clear()});
sketchRefine.addEventListener("click",refineCurrentSketch);
sketchSave.addEventListener("click",saveCurrentSketch);

avatarForm.addEventListener("input",event=>{
  if(event.target.closest("#avatarTraits")||event.target.closest("#avatarInterests")||event.target.closest("#avatarCollaboration"))return;
  renderAvatarPreview();
});

saveAvatarDraftBtn.addEventListener("click",()=>{
  if(avatarCreationMode==="sketch"&&!noema.avatarFoundry.currentSketch()) saveCurrentSketch();
  const result=noema.saveAvatarDraft(avatarInput());
  avatarStatus.textContent=result.reason;
  renderAvatarPreview();
  handleRoute();
});

hearMentorBtn.addEventListener("click",()=>{
  const input=avatarInput();
  const draft=noema.avatarFoundry.draft(input);
  const text=draft?.mentorId ? noema.avatarFoundry.greeting(draft) : `Hi! I’m ${input.displayName}.`;
  speakMentorText(text,input.voice);
});

avatarForm.addEventListener("submit",event=>{
  event.preventDefault();
  if(avatarCreationMode==="sketch"&&!noema.avatarFoundry.currentSketch()){
    const saved=saveCurrentSketch();
    if(!saved?.ok) return;
  }
  if(!confirm(`Adopt ${avatarName.value||"this mentor"} as your learning companion?`))return;
  const result=noema.adoptAvatar(avatarInput());
  avatarStatus.textContent=result.reason;
  renderAvatarPreview();
  handleRoute();
});

avatarBtn.addEventListener("click",openAvatarFoundry);
avatarClose.addEventListener("click",closeAvatarFoundry);
avatarDrawer.addEventListener("click",e=>{if(e.target===avatarDrawer)closeAvatarFoundry()});
window.addEventListener("resize",()=>{if(!avatarDrawer.hidden)sketchPad.resize()});
if("speechSynthesis" in window){
  speechSynthesis.addEventListener?.("voiceschanged",populateVoices);
}

avatarHairStyle.innerHTML=optionize(HAIR_STYLES,"wavy");
avatarOutfitStyle.innerHTML=optionize(OUTFIT_STYLES,"classic");
avatarPrimaryColor.innerHTML=optionize(ACCENT_COLORS,"midnight");
avatarSecondaryColor.innerHTML=optionize(ACCENT_COLORS,"gold");
avatarTemperament.innerHTML=optionize(PRIMARY_TEMPERAMENTS,"curious");
fillChoiceGrid(avatarTraits,MENTOR_TRAITS,4);
fillChoiceGrid(avatarInterests,[
  "music","cooking","reading","art","writing","science","mathematics","history",
  "nature","animals","space","technology","building","games","sports","languages",
  "design","photography","film","gardening"
],8);
fillChoiceGrid(avatarCollaboration,COLLABORATION_STYLES,4);
rerenderSkin();rerenderHair();rerenderEyes();


function openEnrollment() {
  enrollmentDrawer.hidden = false;
  renderEnrollment();
}

function closeEnrollment() {
  enrollmentDrawer.hidden = true;
}

function selectedInterests() {
  return [...enrollInterests.querySelectorAll('input[type="checkbox"]:checked')]
    .map(input => input.value)
    .slice(0, 8);
}

function renderEnrollment() {
  const status = noema.getEnrollmentStatus();
  const profile = status.profile;
  const relationship = status.mentorRelationship;
  const server = status.sync?.server || {};

  serverStatusPill.textContent = server.enabled ? "Secure host configured" : "Local only";

  if (profile) {
    enrollDisplayName.value = profile.displayName || "";
    enrollBirthMonth.value = profile.birthMonth || "";
    enrollBirthYear.value = profile.birthYear || "";
    enrollEducationSetting.value = profile.learning?.educationSetting || "independent";
    enrollGrade.value = profile.learning?.gradeLevel || "not-applicable";
    enrollLearningStage.value = profile.learning?.learningStage || "";
    enrollFavoriteSubject.value = profile.learning?.favoriteSubject || "not-sure-yet";

    const interestSet = new Set(profile.learning?.interests || []);
    enrollInterests.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = interestSet.has(input.value);
    });
  }

  identitySummary.innerHTML = profile
    ? `
      <div class="identity-summary-box">
        <span>Person</span>
        <strong>${escapeHtml(profile.displayName)}</strong>
      </div>
      <div class="identity-summary-box">
        <span>Enrollment pathway</span>
        <strong>${escapeHtml(profile.accountPathway)}</strong>
      </div>
      <div class="identity-summary-box">
        <span>Learning placement</span>
        <strong>${escapeHtml(profile.learning?.gradeLevel || "not-applicable")}${profile.learning?.learningStage ? ` · ${escapeHtml(profile.learning.learningStage)}` : ""}</strong>
      </div>
      <div class="identity-summary-box">
        <span>Mentor relationship</span>
        <strong>${relationship ? "Persistent local prototype created" : "Created after enrollment"}</strong>
      </div>
      <div class="identity-summary-box">
        <span>Cross-device persistence</span>
        <strong>${server.enabled ? "Server seam configured; authentication still required" : "Not active — local browser only"}</strong>
      </div>
    `
    : `
      <div class="memory-empty">
        Create the local enrollment profile to establish the person → mentor relationship spine.
      </div>
    `;
}

enrollmentForm.addEventListener("submit", event => {
  event.preventDefault();

  const result = noema.saveEnrollment({
    displayName: enrollDisplayName.value,
    birthMonth: Number(enrollBirthMonth.value),
    birthYear: Number(enrollBirthYear.value),
    educationSetting: enrollEducationSetting.value,
    gradeLevel: enrollGrade.value,
    learningStage: enrollLearningStage.value,
    favoriteSubject: enrollFavoriteSubject.value,
    interests: selectedInterests()
  });

  enrollmentMessage.textContent = result.reason;

  if (result.ok) {
    renderEnrollment();
    handleRoute();
  }
});

enrollmentBtn.addEventListener("click", openEnrollment);
enrollmentClose.addEventListener("click", closeEnrollment);
enrollmentDrawer.addEventListener("click", event => {
  if (event.target === enrollmentDrawer) closeEnrollment();
});


function openMemory() {
  memoryDrawer.hidden = false;
  document.body.classList.add("memory-open");
  renderMemoryLibrary();
  renderProjects();
}

function closeMemory() {
  memoryDrawer.hidden = true;
  document.body.classList.remove("memory-open");
}

function renderMemoryLibrary() {
  const items = noema.memory.list({ activeOnly: false }).slice().reverse();
  memoryCount.textContent = `${items.length} retained`;

  if (!items.length) {
    memoryList.innerHTML = `
      <div class="memory-empty">
        Nothing is stored in long-term memory yet. Conversation alone does not create a memory.
      </div>
    `;
    return;
  }

  memoryList.innerHTML = items.map(item => `
    <article class="memory-item" data-memory-id="${escapeHtml(item.id)}">
      <div class="memory-item-head">
        <div>
          <span class="memory-kind">${escapeHtml(item.kind)}</span>
          <strong>${escapeHtml(item.title || "Untitled memory")}</strong>
        </div>
        <span class="memory-scope">${escapeHtml(item.scope)}</span>
      </div>
      <p>${escapeHtml(item.content)}</p>
      <div class="memory-meta">
        Source: ${escapeHtml(item.source?.label || "User")}
        · Updated ${new Date(item.updatedAt).toLocaleString()}
      </div>
      ${item.tags?.length ? `<div class="memory-tags">${item.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <div class="memory-item-actions">
        <button type="button" class="mini-btn edit-memory" data-id="${escapeHtml(item.id)}">Edit</button>
        <button type="button" class="mini-btn delete-memory" data-id="${escapeHtml(item.id)}">Delete</button>
      </div>
    </article>
  `).join("");

  memoryList.querySelectorAll(".delete-memory").forEach(button => {
    button.addEventListener("click", () => {
      if (!confirm("Delete this retained memory?")) return;
      const result = noema.deleteMemory(button.dataset.id);
      memoryStatus.textContent = result.reason;
      renderMemoryLibrary();
      handleRoute();
    });
  });

  memoryList.querySelectorAll(".edit-memory").forEach(button => {
    button.addEventListener("click", () => {
      const item = noema.memory.get(button.dataset.id);
      if (!item) return;
      const next = prompt("Edit this memory:", item.content);
      if (next === null) return;
      const result = noema.updateMemory(item.id, { content: next });
      memoryStatus.textContent = result.reason;
      renderMemoryLibrary();
      handleRoute();
    });
  });
}

memoryForm.addEventListener("submit", event => {
  event.preventDefault();

  const result = noema.saveMemory({
    title: memoryTitle.value,
    content: memoryContent.value,
    kind: memoryKind.value,
    scope: memoryScope.value,
    tags: memoryTags.value.split(",").map(tag => tag.trim()).filter(Boolean),
    source: {
      type: "user-explicit",
      label: "Saved explicitly in NOEMA Memory Library"
    },
    confidence: 1
  });

  memoryStatus.textContent = result.reason;

  if (result.ok) {
    memoryForm.reset();
    memoryScope.value = activeMode;
    renderMemoryLibrary();
    handleRoute();
  }
});

function renderProjects() {
  const projects = noema.projects.list().slice().reverse();
  const active = noema.projects.active();

  activeProjectLabel.textContent = active ? active.title : "No active project";

  if (!projects.length) {
    projectList.innerHTML = `<div class="memory-empty">No persistent project context yet.</div>`;
    return;
  }

  projectList.innerHTML = projects.map(project => `
    <article class="project-item ${active?.id === project.id ? "active" : ""}">
      <div>
        <strong>${escapeHtml(project.title)}</strong>
        <span>${escapeHtml(project.mode)} · ${escapeHtml(project.status)}</span>
      </div>
      <p>${escapeHtml(project.summary || "No summary yet.")}</p>
      <div class="memory-item-actions">
        <button type="button" class="mini-btn activate-project" data-id="${escapeHtml(project.id)}">
          ${active?.id === project.id ? "Active" : "Use context"}
        </button>
        <button type="button" class="mini-btn remove-project" data-id="${escapeHtml(project.id)}">Remove</button>
      </div>
    </article>
  `).join("");

  projectList.querySelectorAll(".activate-project").forEach(button => {
    button.addEventListener("click", () => {
      noema.projects.setActive(button.dataset.id);
      renderProjects();
      handleRoute();
    });
  });

  projectList.querySelectorAll(".remove-project").forEach(button => {
    button.addEventListener("click", () => {
      if (!confirm("Remove this project context?")) return;
      noema.projects.remove(button.dataset.id);
      renderProjects();
      handleRoute();
    });
  });
}

projectForm.addEventListener("submit", event => {
  event.preventDefault();
  noema.projects.create({
    title: projectTitle.value,
    summary: projectSummary.value,
    mode: projectMode.value,
    status: "active"
  });
  projectForm.reset();
  projectMode.value = activeMode;
  renderProjects();
  handleRoute();
});

exportMemoryBtn.addEventListener("click", () => {
  const payload = JSON.stringify(noema.memory.export(), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `noema-memory-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

memoryBtn.addEventListener("click", openMemory);
memoryClose.addEventListener("click", closeMemory);
memoryDrawer.addEventListener("click", event => {
  if (event.target === memoryDrawer) closeMemory();
});

routeBtn.addEventListener("click", handleRoute);

clearBtn.addEventListener("click", () => {
  messageEl.value = "";
  responseEl.innerHTML =
    "Noema's local shell is ready. Constitutional policy is active; a conversational model provider has not been connected yet.";
});

eraseBtn.addEventListener("click", () => {
  if (!confirm("Clear all NOEMA local preferences, short-term continuity, long-term Memory Library, and project context on this browser?")) return;
  noema.clearNoemaData();
  activeMode = "personal";
  renderModes();
  renderMode(activeMode);
  renderMemoryLibrary();
  renderProjects();
  renderEnrollment();
  avatarStatus.textContent = "NOEMA local avatar data cleared.";
  activeVerification = null;
  renderVerifier();
  refinedSketchStrokes = [];
  sketchPad.clear();
  renderAvatarPreview();
  responseEl.innerHTML =
    "NOEMA local preferences, continuity, Memory Library, and project context were cleared. Other applications were not affected.";
});

renderModes();
renderMode(activeMode);
memoryScope.value = activeMode;
projectMode.value = activeMode;
renderMemoryLibrary();
renderProjects();
renderEnrollment();
handleRoute();
