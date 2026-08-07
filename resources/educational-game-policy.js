export function educationalGameStatus(resource={}) {
  if(resource.resourceType!=="game") {
    return {game:false,eligibleForEducationalRanking:false,reason:"not-a-game"};
  }

  if(resource.learningValue==="recreational") {
    return {game:true,eligibleForEducationalRanking:false,reason:"recreational"};
  }

  const objectives=Array.isArray(resource.learningObjectives)
    ? resource.learningObjectives.filter(Boolean)
    : [];

  if(!objectives.length) {
    return {
      game:true,
      eligibleForEducationalRanking:false,
      reason:"learning-objective-not-established"
    };
  }

  return {
    game:true,
    eligibleForEducationalRanking:true,
    reason:"explicit-learning-metadata"
  };
}

export function queryRequestsGame(query="") {
  return /\b(game|play|practice game|trivia|quiz|fun practice)\b/i.test(String(query || ""));
}
