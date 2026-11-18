// Numeric comparison is inferred only when every meaningful key has a numeric form.
// Trailing quotes occur in an inherited sort-value attribute; preserve that attribute.
export function numericKey(value){
 const text=value.trim();
 if(!/^(?:c\.\s*)?[+-]?(?:\d[\d,]*(?:\.\d+)?|\.\d+)(?:\s*(?:%|x|kg|pts|nu|["']+))?$/i.test(text))return null;
 return Number.parseFloat(text.replace(/^c\.\s*/i,'').replaceAll(',',''));
}
export function numericColumn(values,declared){
 if(declared)return declared==='number';
 const present=values.filter(v=>!/^\s*[-–—]?\s*$/.test(v));
 return present.length>0 && present.every(v=>numericKey(v)!==null);
}
