// Logic for the Slide-Out Visual Editor Panel

export class EditorController {
    constructor(elements, callbacks) {
        this.els = elements;
        this.callbacks = callbacks; // { onUpdate: fn, getCurrentStyle: fn, onAddRule: fn }
        this.selectedFeature = null;
        this.selectedElement = null;

        this.initListeners();
    }

    initListeners() {
        // Toggle Panel
        this.els.toggleBtn.addEventListener('click', () => this.togglePanel());
        this.els.closeBtn.addEventListener('click', () => this.closePanel());

        // List Interactions
        this.els.featureList.addEventListener('click', (e) => this.handleFeatureClick(e));
        this.els.elementList.addEventListener('click', (e) => this.handleElementClick(e));

        // Custom Feature ID Logic
        this.els.setCustomIdBtn.addEventListener('click', () => this.addCustomFeature());
        
        // Feature Rename Logic
        this.els.featureRenameInput.addEventListener('input', (e) => this.handleRename(e));

        // Styler Syncs
        this.bindStylerSync(this.els.colorInput, this.els.colorText, this.els.colorPreview);
        this.bindRangeSync(this.els.satRange, this.els.satVal);
        this.bindRangeSync(this.els.lightRange, this.els.lightVal);

        // Add Rule
        this.els.addRuleBtn.addEventListener('click', () => this.applyRule());
    }

    togglePanel() {
        const panel = this.els.panel;
        if(panel.classList.contains('-translate-x-[120%]')) {
            // Open
            panel.classList.remove('-translate-x-[120%]', 'md:-translate-x-full');
            panel.classList.add('translate-x-0');
            this.highlightActiveRules();
        } else {
            this.closePanel();
        }
    }

    closePanel() {
        const panel = this.els.panel;
        panel.classList.add('-translate-x-[120%]', 'md:-translate-x-full');
        panel.classList.remove('translate-x-0');
    }

    handleFeatureClick(e) {
        const item = e.target.closest('.selectable-item');
        if (!item) return;

        // UI Update
        this.els.featureList.querySelectorAll('.selectable-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        
        // State Update
        this.selectedFeature = item.getAttribute('data-value');

        // Handle Rename Input Visibility
        if(item.hasAttribute('data-custom')) {
            this.els.featureRenameContainer.classList.remove('hidden');
            const name = item.childNodes[0].textContent.trim();
            this.els.featureRenameInput.value = name;
        } else {
            this.els.featureRenameContainer.classList.add('hidden');
        }

        // Unlock Next Step
        this.els.colElement.classList.remove('step-disabled');
        
        // Reset Next Steps
        this.selectedElement = null;
        this.els.elementList.querySelectorAll('.selectable-item').forEach(el => el.classList.remove('selected'));
        this.els.colStylers.classList.add('step-disabled');
        this.els.addRuleBtn.disabled = true;

        this.highlightActiveRules();
    }

    handleElementClick(e) {
        const item = e.target.closest('.selectable-item');
        if (!item) return;

        this.els.elementList.querySelectorAll('.selectable-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        
        this.selectedElement = item.getAttribute('data-value');

        this.els.colStylers.classList.remove('step-disabled');
        this.els.addRuleBtn.disabled = false;

        // Populate Values
        this.populateStylers();
    }

    addCustomFeature() {
        const val = this.els.customIdInput.value.trim();
        if(!val) return;

        const name = `Custom Feature`;
        const newItem = document.createElement('div');
        newItem.className = "selectable-item p-2 pl-3 text-sm cursor-pointer hover:bg-gray-50 border-l-4 border-transparent text-gray-600";
        newItem.setAttribute('data-value', val);
        newItem.setAttribute('data-custom', 'true');
        newItem.innerHTML = `${name} <span class="text-[10px] text-gray-400 font-normal ml-1 pointer-events-none">(${val})</span>`;
        
        this.els.customListContainer.appendChild(newItem);
        newItem.click(); // Auto select
        this.els.customIdInput.value = '';
    }

    handleRename(e) {
        if(!this.selectedFeature) return;
        const item = this.els.featureList.querySelector(`.selectable-item.selected[data-value="${this.selectedFeature}"]`);
        if(item && item.hasAttribute('data-custom')) {
            item.innerHTML = `${e.target.value} <span class="text-[10px] text-gray-400 font-normal ml-1 pointer-events-none">(${this.selectedFeature})</span>`;
        }
    }

    populateStylers() {
        // Reset defaults
        this.els.stylerVisibility.value = "";
        this.els.colorText.value = "";
        this.els.colorInput.value = "#000000";
        this.els.colorPreview.style.backgroundColor = "transparent";
        this.els.weightInput.value = "";
        this.els.satRange.value = 0; this.els.satVal.textContent = "0";
        this.els.lightRange.value = 0; this.els.lightVal.textContent = "0";

        const currentStyle = this.callbacks.getCurrentStyle();
        if(!currentStyle) return;

        let rules = currentStyle.endsWith(',') ? currentStyle.slice(0, -1).split(',') : currentStyle.split(',');
        
        const targetFeatToken = `s.t:${this.selectedFeature}`;
        const targetElemToken = `s.e:${this.selectedElement}`;

        // Logic from original code to find matching rule
        for(let r of rules) {
            let parts = r.split('|');
            const hasFeat = parts.some(p => p === targetFeatToken);
            const hasElem = parts.some(p => p === targetElemToken);

            let matches = false;
            if(this.selectedElement === 'a') {
                if(hasFeat && (hasElem || !parts.some(p => p.startsWith('s.e:')))) matches = true;
            } else {
                if(hasFeat && hasElem) matches = true;
            }

            if(matches) {
                this.fillStylerForm(parts);
                break;
            }
        }
        this.highlightActiveRules();
    }

    fillStylerForm(parts) {
        parts.forEach(p => {
            if(p.startsWith('p.v:')) this.els.stylerVisibility.value = p.split(':')[1];
            if(p.startsWith('p.c:')) {
                let c = p.split(':')[1];
                if(c.startsWith('0x')) c = '#' + c.substring(2);
                this.els.colorText.value = c;
                if(/^#[0-9A-F]{6}$/i.test(c)) this.els.colorInput.value = c;
                this.els.colorPreview.style.backgroundColor = c;
            }
            if(p.startsWith('p.w:')) this.els.weightInput.value = p.split(':')[1];
            if(p.startsWith('p.s:')) { this.els.satRange.value = p.split(':')[1]; this.els.satVal.textContent = p.split(':')[1]; }
            if(p.startsWith('p.l:')) { this.els.lightRange.value = p.split(':')[1]; this.els.lightVal.textContent = p.split(':')[1]; }
        });
    }

    applyRule() {
        if(!this.selectedFeature || !this.selectedElement) return;

        let parts = [`s.t:${this.selectedFeature}`, `s.e:${this.selectedElement}`];
        
        const vis = this.els.stylerVisibility.value;
        if (vis) parts.push(`p.v:${vis}`);

        const col = this.els.colorText.value;
        if (col) {
            let c = col.startsWith('#') || col.startsWith('0x') ? col : '#' + col;
            parts.push(`p.c:${c}`);
        }

        const w = this.els.weightInput.value;
        if(w) parts.push(`p.w:${w}`);

        const s = this.els.satRange.value;
        if(s != 0) parts.push(`p.s:${s}`);

        const l = this.els.lightRange.value;
        if(l != 0) parts.push(`p.l:${l}`);

        const newRule = parts.join('|');
        this.callbacks.onAddRule(newRule, this.selectedFeature, this.selectedElement);

        // Visual Feedback
        const btn = this.els.addRuleBtn;
        const txt = btn.innerText;
        btn.innerText = "✓ Updated!";
        btn.classList.replace('bg-indigo-600', 'bg-green-600');
        setTimeout(() => {
            btn.innerText = txt;
            btn.classList.replace('bg-green-600', 'bg-indigo-600');
        }, 1000);
    }

    highlightActiveRules() {
        const currentStyle = this.callbacks.getCurrentStyle();
        const rules = currentStyle ? currentStyle.split(',') : [];

        // 1. Features
        this.els.featureList.querySelectorAll('.selectable-item').forEach(el => {
            const val = el.getAttribute('data-value');
            const has = rules.some(r => r.split('|').includes(`s.t:${val}`));
            has ? el.classList.add('has-rule') : el.classList.remove('has-rule');
        });

        // 2. Elements
        if(this.selectedFeature) {
            this.els.elementList.querySelectorAll('.selectable-item').forEach(el => {
                const val = el.getAttribute('data-value');
                const tf = `s.t:${this.selectedFeature}`;
                const te = `s.e:${val}`;
                
                const has = rules.some(r => {
                    let p = r.split('|');
                    const mf = p.includes(tf);
                    const me = p.includes(te);
                    if(val === 'a') return mf && (me || !p.some(k => k.startsWith('s.e:')));
                    return mf && me;
                });
                has ? el.classList.add('has-rule') : el.classList.remove('has-rule');
            });
        }
        
        // 3. Input Highlights
        if(this.selectedFeature && this.selectedElement) {
            const inputs = [this.els.stylerVisibility, this.els.colorText, this.els.weightInput, this.els.satRange, this.els.lightRange];
            inputs.forEach(i => i.classList.remove('input-has-value'));

            const tf = `s.t:${this.selectedFeature}`;
            const te = `s.e:${this.selectedElement}`;

            const rule = rules.find(r => {
                let p = r.split('|');
                const mf = p.includes(tf);
                const me = p.includes(te);
                if(this.selectedElement === 'a') return mf && (me || !p.some(k => k.startsWith('s.e:')));
                return mf && me;
            });

            if(rule) {
                let p = rule.split('|');
                if(p.some(k => k.startsWith('p.v:'))) this.els.stylerVisibility.classList.add('input-has-value');
                if(p.some(k => k.startsWith('p.c:'))) this.els.colorText.classList.add('input-has-value');
                if(p.some(k => k.startsWith('p.w:'))) this.els.weightInput.classList.add('input-has-value');
                if(p.some(k => k.startsWith('p.s:'))) this.els.satRange.classList.add('input-has-value');
                if(p.some(k => k.startsWith('p.l:'))) this.els.lightRange.classList.add('input-has-value');
            }
        }
    }

    bindStylerSync(colorIn, textIn, box) {
        colorIn.addEventListener('input', e => { 
            textIn.value = e.target.value; 
            box.style.backgroundColor = e.target.value; 
        });
        
        textIn.addEventListener('input', e => {
            let v = e.target.value;
            if(!v.startsWith('#') && v.length > 0) v = '#' + v;
            
            if(/^#[0-9A-F]{6}$/i.test(v)) {
                colorIn.value = v;
            }
            box.style.backgroundColor = v;
        });
    }

    bindRangeSync(range, label) {
        range.addEventListener('input', e => label.textContent = e.target.value);
    }
}