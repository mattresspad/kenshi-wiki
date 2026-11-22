// Served only by the loopback preview harness; never included in deployable assets.
window.turnstile={
  render(target,options){
    const root=document.querySelector(target);
    const label=document.createElement('label');label.htmlFor='preview-scenario';label.textContent='Local preview scenario';
    const select=document.createElement('select');select.id='preview-scenario';
    for(const [value,text] of Object.entries({accepted:'Accepted (simulated)', 'verification-failed':'Verification fails', 'verification-unavailable':'Verification unavailable','delivery-unconfirmed':'Delivery unconfirmed'})){
      const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);
    }
    root.append(label,select);
    const ready=()=>options.callback('local-preview:'+select.value+':'+crypto.randomUUID());
    select.addEventListener('change',ready);this._ready=ready;this._expire=options['expired-callback'];queueMicrotask(ready);return 'local-widget';
  },
  reset(){queueMicrotask(()=>this._ready?.());}
};
