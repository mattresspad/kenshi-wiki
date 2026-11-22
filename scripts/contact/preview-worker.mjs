import {handleContact} from './worker/contact.mjs';
import widget from './preview-widget.js';
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname))return new Response('Local preview only',{status:403});
  if(url.pathname==='/__contact-preview/verification.js')return new Response(widget,{headers:{'Content-Type':'application/javascript','Cache-Control':'no-store'}});
  if(url.pathname==='/api/contact'){
    // The harness replaces only external services. Validation and responses use the shipped handler.
    let scenario='accepted';
    return handleContact(request,{...env,CONTACT_ENABLED:'true',CONTACT_ORIGIN:url.origin},{
      verify:async({token})=>{
        const parts=token.split(':');if(parts[0]!=='local-preview')return false;
        scenario=parts[1];
        if(scenario==='verification-unavailable')throw Error('simulated');
        return scenario!=='verification-failed';
      },
      deliver:async()=>{if(scenario==='delivery-unconfirmed')throw Error('simulated');},
      log:()=>{}
    });
  }
  const response=await env.ASSETS.fetch(request);
  if(['/contact','/contact/copyright'].includes(url.pathname)&&response.status===200){
    return new HTMLRewriter()
      .on('#contact-form',{element(el){el.setAttribute('data-sitekey','local-preview');}})
      .on('.contact-preview-note',{element(el){el.removeAttribute('hidden');el.setInnerContent('Local review: No email is sent. Verification and delivery are simulated. Use the preview scenario control to test failures.');}})
      .on('script[src]',{element(el){if(el.getAttribute('src').startsWith('https://challenges.cloudflare.com/turnstile/'))el.setAttribute('src','/__contact-preview/verification.js');}})
      .transform(response);
  }
  return response;
}};
