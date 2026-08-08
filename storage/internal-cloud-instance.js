import { InternalCloud } from "./internal-cloud.js";

// One same-origin vault instance shared by NAIB / NOEMA modules.
// IndexedDB is opened lazily; no remote service or third-party dependency is used.
export const NAIBInternalCloud = new InternalCloud();
