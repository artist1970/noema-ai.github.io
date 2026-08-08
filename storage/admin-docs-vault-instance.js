import { AdminDocsVault } from "./admin-docs-vault.js";
import { NAIBStorageFabric } from "./storage-fabric-instance.js";

export const NAIBAdminDocsVault = new AdminDocsVault({
  fabric: NAIBStorageFabric
});
