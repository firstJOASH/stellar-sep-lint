// SEP-24 rules - spec v3.8.0 https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0024.md
import type { LintViolation, RuleContext } from '../types.js';
import { isRuleEnabled, getRuleSeverity } from '../config.js';
type J=Record<string,unknown>;
function v(id:string,ctx:RuleContext,msg:string):LintViolation|null{if(!isRuleEnabled(id,ctx.config))return null;return{ruleId:id,severity:getRuleSeverity(id,ctx.config) as 'error'|'warn',message:msg,file:ctx.file};}
const S24=new Set(['incomplete','pending_user_transfer_start','pending_user_transfer_complete','pending_external','pending_anchor','on_hold','pending_stellar','pending_trust','pending_user','completed','refunded','expired','no_market','too_small','too_large','error']);
export function validateSep24Info(raw:unknown,ctx:RuleContext):LintViolation[]{
  const out:LintViolation[]=[]; const p=(x:LintViolation|null)=>{if(x)out.push(x);};
  if(typeof raw!=='object'||raw===null){p(v('sep24/info-not-object',ctx,'SEP-24 /info must be a JSON object'));return out;}
  const info=raw as J;
  if(!info['deposit'])p(v('sep24/info-missing-deposit',ctx,'SEP-24 /info missing required deposit object'));
  if(!info['withdraw'])p(v('sep24/info-missing-withdraw',ctx,'SEP-24 /info missing required withdraw object'));
  for(const sec of ['deposit','withdraw']){const obj=info[sec];if(typeof obj!=='object'||obj===null)continue;for(const [code,val] of Object.entries(obj as J)){if(typeof val!=='object'||val===null){p(v('sep24/info-invalid-asset-entry',ctx,'SEP-24 /info '+sec+'.'+code+' must be object'));continue;}const a=val as J;if(a['enabled']===undefined)p(v('sep24/info-missing-enabled',ctx,'SEP-24 /info '+sec+'.'+code+' missing enabled'));if(a['enabled']!==undefined&&typeof a['enabled']!=='boolean')p(v('sep24/info-invalid-enabled',ctx,'SEP-24 /info '+sec+'.'+code+'.enabled must be boolean'));}}
  return out;
}
export function validateSep24Transaction(raw:unknown,ctx:RuleContext):LintViolation[]{
  const out:LintViolation[]=[]; const p=(x:LintViolation|null)=>{if(x)out.push(x);};
  let tx=raw; if(typeof raw==='object'&&raw!==null&&'transaction' in (raw as J))tx=(raw as J)['transaction'];
  if(typeof tx!=='object'||tx===null){p(v('sep24/transaction-not-object',ctx,'SEP-24 transaction must be a JSON object'));return out;}
  const t=tx as J;
  if(!t['id'])p(v('sep24/transaction-missing-id',ctx,'SEP-24 transaction missing id'));
  if(!t['kind'])p(v('sep24/transaction-missing-kind',ctx,'SEP-24 transaction missing kind'));else if(!['deposit','withdrawal'].includes(String(t['kind'])))p(v('sep24/transaction-invalid-kind',ctx,'SEP-24 transaction.kind must be deposit or withdrawal, got: '+String(t['kind'])));
  if(!t['status'])p(v('sep24/transaction-missing-status',ctx,'SEP-24 transaction missing status'));else if(!S24.has(String(t['status'])))p(v('sep24/invalid-status',ctx,'SEP-24 invalid status: '+String(t['status'])));
  if(!t['started_at'])p(v('sep24/transaction-missing-started-at',ctx,'SEP-24 transaction missing started_at'));
  if(!t['more_info_url'])p(v('sep24/transaction-missing-more-info-url',ctx,'SEP-24 transaction missing more_info_url'));
  return out;
}
export function validateSep24Transactions(raw:unknown,ctx:RuleContext):LintViolation[]{
  const out:LintViolation[]=[]; const p=(x:LintViolation|null)=>{if(x)out.push(x);};
  if(typeof raw!=='object'||raw===null||!Array.isArray((raw as J)['transactions'])){p(v('sep24/transactions-not-array',ctx,'SEP-24 /transactions must have a transactions array'));return out;}
  ((raw as J)['transactions'] as unknown[]).forEach((tx,i)=>out.push(...validateSep24Transaction(tx,{...ctx,file:ctx.file+'['+i+']'})));
  return out;
}
