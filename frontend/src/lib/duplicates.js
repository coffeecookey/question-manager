export function findDuplicateLocations(state, problemUrl, excludeId) {
  if (!problemUrl) return [];
  const results = [];
  for (const topicId of state.topicOrder) {
    const topic = state.topics[topicId];
    if (!topic) continue;
    for (const stId of topic.subTopicIds) {
      const st = state.subTopics[stId];
      if (!st) continue;
      for (const qId of st.questionIds) {
        if (qId === excludeId) continue;
        const q = state.questions[qId];
        if (q && q.problemUrl && q.problemUrl === problemUrl) {
          results.push({
            questionId: qId,
            title: q.title,
            topicName: topic.name,
            subTopicName: st.name,
          });
        }
      }
    }
  }
  return results;
}
