import {contactSettings} from '../../src/contact/config.mjs';
import {requireContactSecret} from './upload-secret.mjs';
if(contactSettings(process.env).enabled)requireContactSecret(process.env.TURNSTILE_SECRET_KEY);
console.log('Contact upload configuration ready; no secret printed or packaged.');
