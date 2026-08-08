import { NAIBInternalCloud } from "./internal-cloud-instance.js";
import { StorageFabric } from "./storage-fabric.js";

// Shared storage router for NAIB. All branches share the browser-origin quota;
// separation is logical and organizational, not a false quota multiplier.
export const NAIBStorageFabric = new StorageFabric({
  metadataCloud: NAIBInternalCloud
});
