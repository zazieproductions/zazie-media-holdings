const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let records = [];
let selected = 'PROT-147';
const palette = ['#5cf2ff','#8b7cff','#ff3ea5','#e6ff4a','#ffb347','#7de5ad','#9db6ff','#e6b8ff'];
const disciplines = ['Applied Anomalies','Experimental Audio Systems','Computational Creativity','Speculative Engineering','Perceptual Interfaces','Generative Software','Signal Archaeology','Acoustic Architecture'];
const colorOf = (record) => palette[disciplines.indexOf(record.discipline)] || '#5cf2ff';
function sourceLink(record, label = 'OPEN ORIGINAL DOSSIER ↗') { return `<a class="atlas-source" href="${record.url}" target="_blank" rel="noopener noreferrer">${label}</a>`; }
function spec(label, value) { return `<div class="atlas-spec"><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`; }
function schematic(record) {
  const types = ['cross-section','signal-flow','polar-directivity','resonator-cavity','subterranean-array'];
  const index = Math.max(0, types.indexOf(record.schematicType));
  const labels = ['SECTION / ENVELOPE','INPUT / PROCESS / OUTPUT','POLAR / AXIS','RESONANT / CAVITY','ARRAY / DEPLOYMENT'];
  const drawings = [
    '<rect x="95" y="52" width="330" height="120" rx="4"/><rect x="135" y="75" width="250" height="74"/><path d="M260 36v150M65 112h390" stroke-dasharray="5 5"/><circle cx="260" cy="112" r="25"/>',
    '<rect x="35" y="75" width="115" height="75" rx="5"/><rect x="205" y="60" width="115" height="105" rx="5"/><rect x="375" y="75" width="115" height="75" rx="5"/><path d="M150 112h55m115 0h55" stroke-dasharray="6 4"/><circle cx="262" cy="112" r="22"/>',
    '<circle cx="260" cy="112" r="80"/><circle cx="260" cy="112" r="49"/><circle cx="260" cy="112" r="18"/><path d="M140 112h240M260 10v204M260 112Q350 25 374 112Q350 199 260 112Z"/>',
    '<rect x="70" y="58" width="380" height="108" rx="50"/><path d="M120 112c30-80 60 80 90 0s60-80 90 0 60 80 90 0"/><circle cx="260" cy="112" r="38"/>',
    '<path d="M70 175h380M100 150h320M140 125h240M180 100h160M220 75h80"/><circle cx="125" cy="112" r="14"/><circle cx="260" cy="112" r="14"/><circle cx="395" cy="112" r="14"/><path d="M125 112l135-37 135 37-135 63Z"/>'
  ];
  return `<figure class="atlas-schematic"><div class="atlas-chart-head"><span>FIG 02 / ${labels[index]}</span><span>${escapeHTML(record.schematicType.toUpperCase())}</span></div><svg viewBox="0 0 520 225" role="img" aria-label="Conceptual ${escapeHTML(record.schematicType)} schematic category for ${escapeHTML(record.id)}"><defs><pattern id="schematic-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#5cf2ff" stroke-opacity=".12"/></pattern></defs><rect width="520" height="225" fill="url(#schematic-grid)"/><g fill="none" stroke="#5cf2ff" stroke-width="1.5">${drawings[index]}</g><text x="16" y="210" fill="#8faab5" font-size="10" font-family="monospace">${escapeHTML(record.code)} / SCHEMATIC CATEGORY OVERVIEW</text></svg><figcaption>Conceptual diagram keyed to the source record’s schematic type. The original technical drawing is in the linked ZIAA dossier.</figcaption></figure>`;
}
function profile(p) {
  const fields = [['CARRIER',`${p.carrierFreq} Hz`],['MODULATION',`${p.modFreq} Hz`],['FILTER CUTOFF',`${p.filterCutoff} Hz`],['RESONANCE',`Q ${p.resonance}`],['BINAURAL DELTA',`±${p.binauralDelta} Hz`],['WAVEFORM',p.waveform],['FILTER',p.filterType],['NOISE LEVEL',`${Math.round(p.noiseLevel * 100)}%`],['HARMONIC SCATTER',`${Math.round(p.harmonicScatter * 100)}%`]];
  return `<div class="atlas-profile"><h3>ACOUSTIC CALIBRATION / ${escapeHTML(p.presetName)}</h3><div class="atlas-profile-grid">${fields.map(([label,value]) => `<div><small>${label}</small><strong>${escapeHTML(value)}</strong></div>`).join('')}</div><p>${escapeHTML(p.description)}</p></div>`;
}
function related(record) {
  const links = [...record.patents.map((id) => [id,`https://zazieinstitute.org/patents/${id.toLowerCase()}/`]),...record.logs.map((id) => [id,`https://zazieinstitute.org/research-notes/${id.toLowerCase()}/`])];
  return `<div class="atlas-related"><span>RELATED RECORDS & FIELD NOTES</span><div>${links.map(([id,url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHTML(id)} ↗</a>`).join('')}</div>${record.deployments.length ? `<p><b>FIELD SITES</b> ${record.deployments.map(escapeHTML).join(' · ')}</p>` : ''}${record.warnings.length ? `<ul>${record.warnings.map((warning) => `<li>${escapeHTML(warning)}</li>`).join('')}</ul>` : ''}</div>`;
}
function renderDetail(record) {
  const color = colorOf(record);
  const bandwidth = record.bandwidth?.match(/([\d.]+) Hz – ([\d.]+) kHz/);
  const chart = bandwidth ? `<div class="atlas-chart"><div class="atlas-chart-head"><span>FIG 01 / REPORTED OPERATING BAND</span><span>LOG FREQUENCY SCALE</span></div><div class="atlas-frequency"><span>10 Hz</span><span>100 Hz</span><span>1 kHz</span><span>10 kHz</span><span>60 kHz</span></div><div class="atlas-chart-track"><div class="atlas-chart-range" style="left:${Math.max(0,Math.log10(Number(bandwidth[1])/10)/Math.log10(6000)*100)}%;right:${Math.max(0,(1-Math.log10(Number(bandwidth[2])*1000/10)/Math.log10(6000))*100)}%;background:${color}"></div></div><p class="mt-3 font-mono text-[10px] text-mute">PUBLISHED RANGE: ${escapeHTML(record.bandwidth)} · SCALE IS LOGARITHMIC, NOT A RESPONSE CURVE.</p></div>` : '';
  const specs = [['OPERATIONAL BANDWIDTH',record.bandwidth],['SIGNAL-TO-NOISE',record.snr],['DIMENSIONS',record.dimensions],['POWER INPUT',record.power],['PRIMARY TRANSDUCER',record.transducer],['COMPUTATIONAL CORE / DSP',record.processor],['LEAD INVESTIGATOR',record.investigator],['INTERFACE PROTOCOLS',record.protocols?.join(' · ')]].filter(([,value]) => value);
  $('prototypeDetail').innerHTML = `<div class="atlas-detail-band" style="--atlas-accent:${color}"><div class="flex justify-between gap-3 font-mono text-[10px] tracking-widest"><span>ENGINEERING RECORD / ${record.id}</span><span>REV ${String(record.revision).padStart(2,'0')}</span></div><div class="atlas-orbit" aria-hidden="true"><span></span><span></span><span></span></div><div class="relative"><p class="font-mono text-xs mb-3">${escapeHTML(record.code)}</p><h2 class="text-2xl md:text-3xl font-bold leading-tight">${escapeHTML(record.title || record.code)}</h2></div></div><div class="p-6 md:p-8"><div class="flex flex-wrap gap-2 font-mono text-[10px] mb-6"><span class="atlas-tag">${escapeHTML(record.discipline)}</span>${record.year ? `<span class="atlas-tag">${record.year}</span>` : ''}${record.status ? `<span class="atlas-tag">${escapeHTML(record.status)}</span>` : ''}${record.clearance ? `<span class="atlas-tag">${escapeHTML(record.clearance)}</span>` : ''}</div>${record.summary ? `<p class="text-mute text-sm leading-relaxed mb-7">${escapeHTML(record.summary)}</p>` : `<p class="text-mute text-sm leading-relaxed mb-7">This generation is indexed in the Institute archive. Open the original record for its published technical summary and complete specification sheet.</p>`}${chart}<h3 class="font-mono text-[11px] tracking-widest text-cy mt-8 mb-3">${specs.length ? 'PUBLISHED ENGINEERING DATA' : 'TECHNICAL DOCUMENTATION'}</h3>${specs.length ? `<dl class="atlas-spec-grid">${specs.map(([label,value]) => spec(label,value)).join('')}</dl>` : `<p class="text-sm text-mute">Specifications for this revision are available in the source dossier. No values have been copied from a different generation.</p>`}${record.schematicType ? schematic(record) : ''}${record.audioProfile ? profile(record.audioProfile) : ''}${record.technicalNotes ? `<div class="atlas-notes"><h3>TRANSDUCTION DYNAMICS</h3><p>${escapeHTML(record.technicalNotes)}</p></div>` : ''}${record.billOfMaterials ? `<div class="atlas-bom"><h3>BILL OF MATERIALS / SELECTED COMPONENTS</h3><div class="atlas-table-wrap"><table><thead><tr><th>COMPONENT</th><th>SUPPLIER</th><th>PART NO.</th><th>TOLERANCE</th></tr></thead><tbody>${record.billOfMaterials.map((row) => `<tr>${row.map((cell) => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>` : ''}${related(record)}<div class="mt-8">${sourceLink(record)}</div><p class="font-mono text-[10px] text-mute mt-4">SOURCE: ZAZIE INSTITUTE / ${record.id}. Snapshot from the ZIAA public research archive; schematic shown here is a category overview, not the original drawing.</p></div>`;
}
function renderList() {
  const query = $('prototypeSearch').value.trim().toLowerCase();
  const discipline = $('disciplineFilter').value;
  const revision = $('revisionFilter').value;
  const visible = records.filter((record) => (!discipline || record.discipline === discipline) && (!revision || String(record.revision) === revision) && (!query || [record.id,record.code,record.title,record.transducer,record.investigator,record.discipline].some((value) => value?.toLowerCase().includes(query))));
  $('resultCount').textContent = `${visible.length} / ${records.length} RECORDS`;
  $('prototypeList').innerHTML = visible.length ? visible.map((record) => `<button type="button" class="atlas-row ${record.id === selected ? 'is-selected' : ''}" data-id="${record.id}" aria-label="Inspect ${record.id}, ${escapeHTML(record.title || record.code)}" aria-pressed="${record.id === selected}" style="--atlas-accent:${colorOf(record)}"><span class="atlas-row-id">${record.id}<small>REV ${String(record.revision).padStart(2,'0')}</small></span><span class="atlas-row-main"><strong>${escapeHTML(record.title || record.code)}</strong><small>${escapeHTML(record.discipline)} · ${escapeHTML(record.code)}</small></span><span class="atlas-row-end">${record.bandwidth ? `<small>${escapeHTML(record.bandwidth)}</small>` : '<small>SOURCE DOSSIER</small>'}<b aria-hidden="true">↗</b></span></button>`).join('') : '<div class="p-8 text-center text-mute">No records match those filters. Try another search or generation.</div>';
}
async function init() {
  try {
    const response = await fetch('/data/prototypes.json');
    if (!response.ok) throw new Error('Archive data unavailable');
    records = await response.json();
    $('disciplineFilter').innerHTML += disciplines.map((value) => `<option value="${value}">${value}</option>`).join('');
    const requested = new URLSearchParams(location.search).get('id')?.toUpperCase();
    if (records.some((record) => record.id === requested)) selected = requested;
    renderList(); renderDetail(records.find((record) => record.id === selected));
    for (const id of ['prototypeSearch','disciplineFilter','revisionFilter']) $(id).addEventListener(id === 'prototypeSearch' ? 'input' : 'change', renderList);
    $('prototypeList').addEventListener('click', (event) => {
      const button = event.target.closest('[data-id]');
      if (!button) return;
      selected = button.dataset.id;
      renderList(); renderDetail(records.find((record) => record.id === selected));
      history.replaceState(null, '', `?id=${selected}`);
      if (matchMedia('(max-width: 1279px)').matches) $('prototypeDetail').scrollIntoView({behavior:'smooth',block:'start'});
    });
  } catch {
    $('resultCount').textContent = 'ARCHIVE UNAVAILABLE';
    $('prototypeList').innerHTML = '<p class="p-6 text-mute">The local index could not load. <a class="text-lime underline" href="https://zazieinstitute.org/prototypes/">Browse the Institute archive ↗</a></p>';
    $('prototypeDetail').innerHTML = '<p class="p-8 text-mute">Technical records are temporarily unavailable.</p>';
  }
}
init();
