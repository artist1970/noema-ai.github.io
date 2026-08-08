import { NAIBStorageFabric } from "./storage-fabric-instance.js";
import { DictionarySovereignCloud } from "./dictionary-sovereign-cloud.js";

export const NAIBDictionaryCloud = new DictionarySovereignCloud({
  fabric: NAIBStorageFabric
});
