const form=document.querySelector('#contact-form');
if(form){
  const send=form.querySelector('#contact-send'),result=form.querySelector('#contact-result'),availability=form.querySelector('#contact-availability');
  let widget=null,token='',busy=false;
  function show(message,errors={}){
    result.replaceChildren();const p=document.createElement('p');p.textContent=message;result.append(p);
    for(const el of form.querySelectorAll('.field-error')){el.hidden=true;el.textContent='';}
    for(const el of form.querySelectorAll('[aria-invalid]'))el.removeAttribute('aria-invalid');
    const list=document.createElement('ul');
    for(const [key,text]of Object.entries(errors)){
      const field=key==='token'?form.querySelector('#contact-verification'):form.elements.namedItem(key),inline=form.querySelector('#error-'+key);
      if(inline){inline.textContent=text;inline.hidden=false;}
      const li=document.createElement('li');
      if(field){field.setAttribute('aria-invalid','true');const a=document.createElement('a');a.href='#'+field.id;a.textContent=text;li.append(a);}else li.textContent=text;
      list.append(li);
    }
    if(list.children.length)result.append(list);
    result.hidden=false;result.focus();
  }
  function resetVerification(){token='';send.disabled=true;if(widget!==null)window.turnstile?.reset(widget);}
  function initialize(){
    if(!form.dataset.sitekey){availability.textContent='The form is not accepting messages yet. Please email admin@kenshi.wiki using the link below.';return true;}
    if(form.dataset.origin&&location.origin!==form.dataset.origin){availability.textContent='This preview does not send messages. Use the contact form on kenshi.wiki or email admin@kenshi.wiki.';return true;}
    if(!window.turnstile)return false;
    widget=window.turnstile.render('#contact-verification',{
      sitekey:form.dataset.sitekey,action:form.dataset.action,'response-field':false,
      callback:value=>{if(form.dataset.accepted==='true')return;token=value;send.disabled=busy;availability.textContent='Verification ready.';},
      'expired-callback':()=>{if(form.dataset.accepted==='true')return;token='';send.disabled=true;availability.textContent='Verification expired. Refresh verification or use email.';if(!busy)window.turnstile.reset(widget);},
      'error-callback':()=>{if(form.dataset.accepted==='true')return;token='';send.disabled=true;availability.textContent='Verification could not load. Please use the email alternative.';}
    });return true;
  }
  let attempts=0;const timer=setInterval(()=>{if(initialize()||++attempts>=100){clearInterval(timer);if(attempts>=100)availability.textContent='Verification could not load. Please use the email alternative.';}},100);
  form.addEventListener('input',event=>{
    const field=event.target;
    if(!field.name||!field.checkValidity?.())return;
    field.removeAttribute('aria-invalid');
    const inline=form.querySelector('#error-'+field.name);
    if(inline){inline.hidden=true;inline.textContent='';}
    for(const link of result.querySelectorAll('a'))if(link.getAttribute('href')==='#'+field.id)link.closest('li')?.remove();
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||form.dataset.accepted==='true')return;
    const errors={};for(const el of form.elements){if(el.willValidate&&!el.checkValidity())errors[el.name]=el.validationMessage;}
    if(!token)errors.token='Complete the verification before sending.';
    if(Object.keys(errors).length){show('Please check the form.',errors);return;}
    const reference='KW-'+crypto.randomUUID();
    busy=true;send.disabled=true;send.textContent='Sending…';
    const data=Object.fromEntries(new FormData(form));data.kind=form.dataset.kind;data.token=token;
    try{
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json','X-Contact-Reference':reference},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});
      const body=await response.json();
      if(response.status===202&&body.accepted===true){
        show(body.message+' Reference: '+body.reference);
        form.dataset.accepted='true';for(const el of form.elements)el.disabled=true;
        send.textContent='Accepted for forwarding';availability.textContent='No acknowledgment email is sent.';
      }else show((body.error||'The submission could not be confirmed.')+(body.reference?' Reference: '+body.reference:''),body.errors||{});
    }catch{show('No confirmation reached this browser. The message may have been accepted. Your text is still here; use admin@kenshi.wiki if needed. No automatic retry was made. Reference: '+reference);}
    finally{busy=false;if(form.dataset.accepted!=='true'){send.textContent='Send privately';resetVerification();}}
  });
}
