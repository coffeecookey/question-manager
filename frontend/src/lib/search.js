export function filterBySearch(state, query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const visibleTopicIds = new Set();
  const visibleSubTopicIds = new Set();
  const visibleQuestionIds = new Set();
  const topicDirectMatch = new Set();
  const subTopicDirectMatch = new Set();
  const questionDirectMatch = new Set();

  for (const topicId of state.topicOrder) {
    const topic = state.topics[topicId];
    if (!topic) continue;

    const topicMatches = topic.name.toLowerCase().includes(q);

    if (topicMatches) {
      topicDirectMatch.add(topicId);
      visibleTopicIds.add(topicId);
      for (const stId of topic.subTopicIds) {
        visibleSubTopicIds.add(stId);
        const st = state.subTopics[stId];
        if (st) {
          for (const qId of st.questionIds) {
            visibleQuestionIds.add(qId);
          }
        }
      }
    }

    for (const stId of topic.subTopicIds) {
      const st = state.subTopics[stId];
      if (!st) continue;

      const stMatches = st.name.toLowerCase().includes(q);

      if (stMatches) {
        subTopicDirectMatch.add(stId);
        visibleTopicIds.add(topicId);
        visibleSubTopicIds.add(stId);
        for (const qId of st.questionIds) {
          visibleQuestionIds.add(qId);
        }
      }

      for (const qId of st.questionIds) {
        const question = state.questions[qId];
        if (!question) continue;

        if (question.title.toLowerCase().includes(q)) {
          questionDirectMatch.add(qId);
          visibleTopicIds.add(topicId);
          visibleSubTopicIds.add(stId);
          visibleQuestionIds.add(qId);
        }
      }
    }
  }

  return {
    visibleTopicIds,
    visibleSubTopicIds,
    visibleQuestionIds,
    topicDirectMatch,
    subTopicDirectMatch,
    questionDirectMatch,
    totalMatches: topicDirectMatch.size + subTopicDirectMatch.size + questionDirectMatch.size,
  };
}
