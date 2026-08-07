import test from "node:test";
import assert from "node:assert/strict";
import {AvatarSupervisor} from "../avatars/avatar-supervisor.js";
import {normalizeAvatarManifest} from "../avatars/avatar-schema.js";

test("valid mentor remains under NOEMA supervision",()=>{
  const supervisor=new AvatarSupervisor();
  const avatar=normalizeAvatarManifest({mentorId:"mentor_12345678",displayName:"Nova"});
  const review=supervisor.inspect(avatar,{ageBand:"child-under-13",accountPathway:"guardian-managed-child"});
  assert.equal(review.ok,true);
  assert.equal(review.supervisor,"noema");
  assert.equal(review.audience,"child");
  assert.equal(review.restrictions.canElevatePermissions,false);
});
