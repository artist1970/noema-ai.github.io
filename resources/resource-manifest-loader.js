import {normalizeResourceManifest,resourceManifestValid} from "./resource-manifest.js";
import {FEDERATION_SOURCE_KINDS} from "./federation-source-registry.js";

async function fetchJson(url,{timeoutMs=3500,fetchImpl=globalThis.fetch}={}) {
  if(typeof fetchImpl!=="function") throw new Error("fetch-unavailable");
  const controller=typeof AbortController!=="undefined" ? new AbortController() : null;
  const timer=controller ? setTimeout(()=>controller.abort(),timeoutMs) : null;
  try {
    const response=await fetchImpl(url,{
      method:"GET",
      credentials:"omit",
      cache:"no-store",
      headers:{"Accept":"application/json"},
      ...(controller ? {signal:controller.signal} : {})
    });
    if(!response.ok) throw new Error(`manifest-http-${response.status}`);
    return await response.json();
  } finally {
    if(timer) clearTimeout(timer);
  }
}

export class ResourceManifestLoader {
  constructor({source,snapshot,fetchImpl}={}) {
    this.source=source || {};
    this.snapshot=normalizeResourceManifest(snapshot || {});
    this.fetchImpl=fetchImpl || globalThis.fetch;
    this.current=this.snapshot;

    const adminInventory=this.source.sourceKind===FEDERATION_SOURCE_KINDS.ADMIN_INVENTORY;
    this.provenance={
      sourceId:this.source.id || this.snapshot.sourceId,
      sourceKind:this.source.sourceKind || "unknown",
      mode:adminInventory ? "admin-approved-inventory-snapshot" : "source-manifest-snapshot",
      refreshed:false,
      refreshedAt:null,
      error:null
    };
  }

  get() {
    return {
      manifest:this.current,
      provenance:{...this.provenance}
    };
  }

  async refresh({allowNetwork=true,timeoutMs=3500}={}) {
    const adminInventory=this.source.sourceKind===FEDERATION_SOURCE_KINDS.ADMIN_INVENTORY;

    if(adminInventory || !allowNetwork || !this.source.url) {
      return this.get();
    }

    try {
      const raw=await fetchJson(this.source.url,{timeoutMs,fetchImpl:this.fetchImpl});
      const normalized=normalizeResourceManifest(raw);
      if(!resourceManifestValid(normalized)) throw new Error("invalid-resource-manifest");
      if(normalized.sourceId!==this.source.id) throw new Error("manifest-source-id-mismatch");

      this.current=normalized;
      this.provenance={
        sourceId:this.source.id,
        sourceKind:this.source.sourceKind,
        mode:"live-source-manifest",
        refreshed:true,
        refreshedAt:new Date().toISOString(),
        error:null
      };
    } catch(error) {
      this.current=this.snapshot;
      this.provenance={
        sourceId:this.source.id || this.snapshot.sourceId,
        sourceKind:this.source.sourceKind,
        mode:"source-manifest-snapshot-fallback",
        refreshed:false,
        refreshedAt:null,
        error:String(error?.message || error).slice(0,300)
      };
    }
    return this.get();
  }
}
