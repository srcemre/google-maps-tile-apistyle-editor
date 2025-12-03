import { MapController } from './core/MapController.js';
import { EditorController } from './ui/EditorController.js';

// DOM Elements
const dom = {
    map: 'map',
    input: document.getElementById('apistyle-input'),
    debugUrl: document.getElementById('debug-url'),
    layerSelect: document.getElementById('layer-select'),
    zoomControl: document.getElementById('zoom-level-control'),
    zoomDisplay: document.getElementById('zoom-display'),
    applyBtn: document.getElementById('apply-style-btn'),
    resetBtn: document.getElementById('reset-style-btn'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    toggleMenuBtn: document.getElementById('toggle-menu-btn'),
    sidebar: document.getElementById('control-panel'),
    
    // Visual Editor Elements
    editor: {
        panel: document.getElementById('visual-editor-panel'),
        toggleBtn: document.getElementById('toggle-visual-editor-btn'),
        closeBtn: document.getElementById('close-editor-btn'),
        featureList: document.getElementById('feature-list'),
        elementList: document.getElementById('element-list'),
        colElement: document.getElementById('col-element'),
        colStylers: document.getElementById('col-stylers'),
        addRuleBtn: document.getElementById('add-rule-btn'),
        customIdInput: document.getElementById('custom-feature-id'),
        setCustomIdBtn: document.getElementById('set-custom-id-btn'),
        customListContainer: document.getElementById('custom-items-list'),
        featureRenameContainer: document.getElementById('feature-rename-container'),
        featureRenameInput: document.getElementById('feature-rename-input'),
        stylerVisibility: document.getElementById('styler-visibility'),
        colorInput: document.getElementById('styler-color'),
        colorText: document.getElementById('styler-color-text'),
        colorPreview: document.getElementById('color-preview-box'),
        weightInput: document.getElementById('styler-weight'),
        satRange: document.getElementById('styler-saturation'),
        satVal: document.getElementById('sat-val'),
        lightRange: document.getElementById('styler-lightness'),
        lightVal: document.getElementById('light-val')
    }
};

// --- APP INITIALIZATION ---
const mapCtrl = new MapController('map');
const mapInstance = mapCtrl.init();

const editorCtrl = new EditorController(dom.editor, {
    getCurrentStyle: () => dom.input.value.trim(),
    onAddRule: (newRule, feature, element) => {
        updateStyleInput(newRule, feature, element);
        triggerUpdate();
    }
});

// --- EVENT HANDLERS ---

// 1. General UI
dom.applyBtn.addEventListener('click', triggerUpdate);

dom.resetBtn.addEventListener('click', () => {
    dom.input.value = '';
    dom.layerSelect.value = 'm';
    resetPresets();
    triggerUpdate();
});

dom.layerSelect.addEventListener('change', triggerUpdate);

dom.zoomControl.addEventListener('input', (e) => {
    const z = parseInt(e.target.value);
    dom.zoomDisplay.textContent = z;
    mapCtrl.setZoom(z);
});

// Sync zoom slider when map zooms
mapInstance.on('zoomend', () => {
    const z = mapInstance.getZoom();
    dom.zoomControl.value = z;
    dom.zoomDisplay.textContent = z;
});

// 2. Presets
dom.presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        resetPresets();
        
        // Apply Styles
        const style = this.getAttribute('data-style');
        const layer = this.getAttribute('data-layer');
        
        dom.input.value = style;
        if(layer) dom.layerSelect.value = layer;

        // Visual Feedback
        this.classList.remove('border-gray-200');
        if (style.includes('ff00ff')) this.classList.add('ring-2', 'ring-pink-500', 'border-pink-500');
        else if (style.includes('9e3527') || style.includes('b02515')) this.classList.add('ring-2', 'ring-red-500', 'border-red-500');
        else if (style.includes('e6dac3') || style.includes('f3e6c8')) this.classList.add('ring-2', 'ring-orange-500', 'border-orange-500');
        else this.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50', 'border-blue-500');
        
        triggerUpdate();
    });
});

// 3. Mobile Menu
dom.toggleMenuBtn.addEventListener('click', () => {
    if (dom.sidebar.classList.contains('-translate-x-full')) dom.sidebar.classList.remove('-translate-x-full');
    else dom.sidebar.classList.add('-translate-x-full');
});

// --- HELPERS ---

function triggerUpdate() {
    const lyrs = dom.layerSelect.value;
    const apistyle = dom.input.value;
    
    // Delegate to Map Core
    const finalUrl = mapCtrl.updateLayer(lyrs, apistyle);
    
    // Update Debug UI
    dom.debugUrl.value = finalUrl.replace('{x}','16515').replace('{y}','11970').replace('{z}','15').replace(/&ts=\d+/, '');
    
    // Update Editor Highlights
    editorCtrl.highlightActiveRules();
}

function updateStyleInput(newRule, feature, element) {
    let currentStyle = dom.input.value.trim();
    if (currentStyle.endsWith(',')) currentStyle = currentStyle.slice(0, -1);
    
    let rules = currentStyle ? currentStyle.split(',') : [];
    let ruleUpdated = false;

    const targetFeatToken = `s.t:${feature}`;
    const targetElemToken = `s.e:${element}`;

    for(let i=0; i<rules.length; i++) {
        let r = rules[i];
        let parts = r.split('|');
        
        const hasFeat = parts.some(p => p === targetFeatToken);
        const hasElem = parts.some(p => p === targetElemToken);
        
        let matches = false;
        if(element === 'a') {
            if(hasFeat && (hasElem || !parts.some(p => p.startsWith('s.e:')))) matches = true;
        } else {
            if(hasFeat && hasElem) matches = true;
        }

        if (matches) {
            rules[i] = newRule;
            ruleUpdated = true;
            break;
        }
    }

    if (!ruleUpdated) {
        rules.push(newRule);
    }

    dom.input.value = rules.join(',');
}

function resetPresets() {
    dom.presetBtns.forEach(b => {
        b.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'border-blue-500', 'ring-pink-500', 'border-pink-500', 'ring-orange-500', 'border-orange-500', 'ring-red-500', 'border-red-500');
        b.classList.add('border-gray-200');
    });
}

// Initial Render
triggerUpdate();