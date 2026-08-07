export const SPECIALIST_ADAPTER_VERSION="1.0";

export function validateSpecialistAdapter(adapter) {
  const required=["id","name","version","capabilities","availability","canExecute","prepare","execute"];
  const missing=required.filter(key=>{
    if(["canExecute","prepare","execute"].includes(key)) return typeof adapter?.[key]!=="function";
    return adapter?.[key]==null;
  });
  return {
    valid:missing.length===0,
    missing
  };
}
