// SEP-1 rules - spec v2.7.0 https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md
import type { LintViolation, RuleContext } from '../types.js';
import { isRuleEnabled, getRuleSeverity } from '../config.js';
const G=/^G[A-Z2-7]{55}$/; const H=/^https:\/\//;
type D=Record<string,unknown>;
function v(id:string,ctx:RuleContext,msg:string):LintViolation|null{ if(!isRuleEnabled(id,ctx.config))return null; return{ruleId:id,severity:getRuleSeverity(id,ctx.config) as 'error'|'warn',message:msg,file:ctx.file}; }
export function validateSep1(doc:D,ctx:RuleContext):LintViolation[]{
  const out:LintViolation[]=[];
  const p=(x:LintViolation|null):void=>{if(x)out.push(x);};
  if(!doc['VERSION']) p(v('sep1/missing-version',ctx,'Missing VERSION (SEP-1 §General Information)'));
  if(!doc['NETWORK_PASSPHRASE']) p(v('sep1/missing-network-passphrase',ctx,'Missing NETWORK_PASSPHRASE (SEP-1 §General Information)'));
  const sk=doc['SIGNING_KEY']; if(sk!==undefined&&(typeof sk!=='string'||!G.test(sk))) p(v('sep1/invalid-signing-key',ctx,'SIGNING_KEY must be a valid G... Stellar public key'));
  if(doc['AUTH_SERVER']!==undefined) p(v('sep1/deprecated-auth-server',ctx,'AUTH_SERVER is deprecated (SEP-1 §General Information)'));
  if(doc['DIRECT_PAYMENT_SERVER']!==undefined&&doc['KYC_SERVER']===undefined) p(v('sep1/direct-payment-requires-kyc',ctx,'DIRECT_PAYMENT_SERVER requires KYC_SERVER (SEP-31 §Prerequisites)'));
  const accts=doc['ACCOUNTS']; if(accts!==undefined){if(!Array.isArray(accts)){p(v('sep1/invalid-accounts',ctx,'ACCOUNTS must be an array'));}else{(accts as unknown[]).forEach((a,i)=>{if(typeof a!=='string'||!G.test(a))p(v('sep1/invalid-accounts',ctx,'ACCOUNTS['+i+'] invalid: '+String(a)));});}}
  for(const f of ['FEDERATION_SERVER','TRANSFER_SERVER','TRANSFER_SERVER_SEP0024','KYC_SERVER','WEB_AUTH_ENDPOINT','DIRECT_PAYMENT_SERVER','ANCHOR_QUOTE_SERVER']){const val=doc[f];if(val!==undefined&&(typeof val!=='string'||!H.test(val)))p(v('sep1/https-required',ctx,f+' must use https://'));}
  const curs=doc['CURRENCIES']; if(Array.isArray(curs)){const aS=['live','dead','test','private'];const aA=['fiat','crypto','nft','stock','bond','commodity','realestate','other'];(curs as unknown[]).forEach((c,i)=>{if(typeof c!=='object'||c===null){p(v('sep1/currency-missing-code',ctx,'CURRENCIES['+i+'] not an object'));return;}const cu=c as D;if(!cu['toml']&&!cu['code'])p(v('sep1/currency-missing-code',ctx,'CURRENCIES['+i+'] missing code'));if(typeof cu['code']==='string'&&cu['code'].length>12)p(v('sep1/currency-code-too-long',ctx,'CURRENCIES['+i+'].code >12 chars'));if(cu['issuer']!==undefined&&(typeof cu['issuer']!=='string'||!G.test(cu['issuer'] as string)))p(v('sep1/currency-invalid-issuer',ctx,'CURRENCIES['+i+'].issuer invalid'));if(cu['status']!==undefined&&!aS.includes(String(cu['status'])))p(v('sep1/currency-invalid-status',ctx,'CURRENCIES['+i+'].status invalid, must be: '+aS.join(',')));if(cu['anchor_asset_type']!==undefined&&!aA.includes(String(cu['anchor_asset_type'])))p(v('sep1/currency-invalid-anchor-asset-type',ctx,'CURRENCIES['+i+'].anchor_asset_type invalid'));if(cu['display_decimals']!==undefined){const dd=Number(cu['display_decimals']);if(!Number.isInteger(dd)||dd<0||dd>7)p(v('sep1/currency-invalid-display-decimals',ctx,'CURRENCIES['+i+'].display_decimals must be 0-7'));}});}
  return out;
}
