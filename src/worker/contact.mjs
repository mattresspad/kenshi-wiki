import {CONTACT_RECIPIENT,CONTACT_SENDER,MAX_BODY_BYTES,fields,forms} from '../contact/policy.mjs';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'};
const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
const controls=/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const oneLine=/[\r\n\u0000-\u001f\u007f]/u;
export function validateSubmission(input){
  if(!input||typeof input!=='object'||Array.isArray(input))return {errors:{form:'Send the form as a JSON object.'}};
  if(Object.keys(input).some(k=>!['kind','topic',...Object.keys(fields)].includes(k)))return {errors:{form:'Unexpected form fields. Reload the form and try again.'}};
  const errors={},data={};
  if(typeof input.kind!=='string'||!Object.hasOwn(forms,input.kind))errors.form='Choose a valid contact form.';
  else {data.kind=input.kind;if(typeof input.topic!=='string'||!Object.hasOwn(forms[input.kind].topics,input.topic))errors.topic='Choose a listed topic.';else data.topic=input.topic;}
  for(const [key,max] of Object.entries(fields)){
    if(typeof input[key]!=='string'){errors[key]='Use plain text in this field.';continue;}
    if(input[key].length>max||controls.test(input[key])){errors[key]='This field is too long or contains unsupported characters.';continue;}
    data[key]=input[key].trim();
  }
  if(data.name&&oneLine.test(input.name))errors.name='Use a single line for your name or preferred credit.';
  if(!data.email||/^\.|\.@|\.\./.test(data.email)||data.email.split('@')[0].length>64||data.email.split('@').slice(1).join('@').split('.').some(label=>label.length>63)||oneLine.test(input.email??'')||!/^[-A-Za-z0-9.!#$%&'*+/=?^_`{|}~]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(data.email))errors.email='Enter a valid reply email address.';
  if(!data.message)errors.message='Explain your question, proposal or concern.';
  if(data.kind==='copyright'&&!data.affected)errors.affected='Identify the affected wiki URL or file.';
  if(!data.token)errors.token='Complete the verification before sending.';
  if(data.website)errors.form='The submission could not be accepted.';
  return {data,errors};
}
async function readBounded(request){
  if(Number(request.headers.get('content-length'))>MAX_BODY_BYTES)throw new RangeError('body');
  const reader=request.body?.getReader();if(!reader)throw new SyntaxError('body');
  const chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY_BYTES){await reader.cancel();throw new RangeError('body');}chunks.push(value);}}
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
export async function verifyTurnstile({token,action,hostname},env,fetcher=fetch){
  const secret=env.TURNSTILE_SECRET_KEY;
  if(!secret||/^[123]x0/.test(secret))throw Error('verification_configuration');
  const response=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({secret,response:token}),signal:AbortSignal.timeout(10000)
  });
  if(!response.ok)throw Error('verification_unavailable');
  const result=await response.json();
  return result.success===true&&result.action===action&&result.hostname===hostname;
}
export function emailFor(data,reference){
  return {from:CONTACT_SENDER,to:CONTACT_RECIPIENT,replyTo:data.email,
    subject:'[Kenshi Wiki] '+forms[data.kind].topics[data.topic]+' — '+reference,
    text:['Private Kenshi Wiki form submission','Reference: '+reference,
      'Topic: '+forms[data.kind].topics[data.topic],'Name / preferred credit: '+(data.name||'(not supplied)'),
      'Reply address: '+data.email,'','Affected URL or file:',data.affected||'(not supplied)','',
      'Message:',data.message,'','This is an unreviewed submission. Links and claims are supplied by the sender.',
      'Submission does not publish content or authorize removal.'].join('\n')};
}
export async function handleContact(request,env,services={}){
  const requestedReference=request.headers.get('X-Contact-Reference');
  const reference=/^KW-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestedReference??'')?requestedReference:'KW-'+crypto.randomUUID();
  const log=services.log??(record=>console.log(JSON.stringify(record)));
  const finish=(status,code,body={})=>{log({event:'contact',reference,status,code});return reply(status,{reference,...body});};
  if(request.method!=='POST')return new Response(JSON.stringify({error:'Use the contact form to send a message.'}),{status:405,headers:{...headers,Allow:'POST'}});
  const origin=env.CONTACT_ORIGIN||'https://kenshi.wiki';
  if(new URL(request.url).origin!==origin||request.headers.get('origin')!==origin)return finish(403,'origin',{error:'Open the form on Kenshi Wiki before sending.'});
  if(env.CONTACT_ENABLED!=='true')return finish(503,'disabled',{error:'The form is not accepting messages yet. Please email admin@kenshi.wiki.'});
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return finish(415,'content_type',{error:'Send plain text through the contact form; attachments are not supported.'});
  let input;try{input=await readBounded(request);}catch(error){return finish(error instanceof RangeError?413:400,'invalid_body',{error:error instanceof RangeError?'The message exceeds the 64 KiB limit.':'The form data could not be read.'});}
  const {data,errors}=validateSubmission(input);
  if(Object.keys(errors).length)return finish(422,'validation',{error:'Please check the highlighted fields.',errors});
  let verified;
  try{verified=await (services.verify??verifyTurnstile)({token:data.token,action:forms[data.kind].action,hostname:new URL(origin).hostname},env);}
  catch{return finish(503,'verification_unavailable',{error:'Verification is unavailable. Your text is still here; try again or email admin@kenshi.wiki.'});}
  if(!verified)return finish(403,'verification',{error:'Verification expired or did not pass. Please complete it again.',errors:{token:'Complete a fresh verification.'}});
  try{await (services.deliver??(message=>env.CONTACT_MAIL.send(message)))(emailFor(data,reference));}
  catch{return finish(503,'delivery_unconfirmed',{error:'We could not confirm acceptance for forwarding. The message may have been forwarded. Keep this reference and use admin@kenshi.wiki if needed; no automatic retry was made.'});}
  return finish(202,'accepted',{accepted:true,message:'Accepted for forwarding to the wiki maintainer. This does not confirm inbox delivery or completed review. No acknowledgment email will be sent, and there is no guaranteed response deadline.'});
}
