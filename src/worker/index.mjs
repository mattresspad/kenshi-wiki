import {CONTACT_ENDPOINT} from '../contact/policy.mjs';
import {handleContact} from './contact.mjs';
export default {async fetch(request,env){
  if(new URL(request.url).pathname===CONTACT_ENDPOINT)return handleContact(request,env);
  return env.ASSETS.fetch(request);
}};
