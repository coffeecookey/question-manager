import { create } from 'zustand';
import { mockApi } from '@/api/mock-api';
import { toast } from 'sonner';

function buildUrlIndex(questions) {
  const index = {};
  for (const q of Object.values(questions)) {
    if (q.problemUrl) {
      if (!index[q.problemUrl]) index[q.problemUrl] = [];
      index[q.problemUrl].push(q.id);
    }
  }
  return index;
}

function addToUrlIndex(index, url, id) {
  if (!url) return index;
  const newIndex = { ...index };
  if (newIndex[url]) {
    newIndex[url] = [...newIndex[url], id];
  } else {
    newIndex[url] = [id];
  }
  return newIndex;
}

function removeFromUrlIndex(index, url, id) {
  if (!url || !index[url]) return index;
  const newIndex = { ...index };
  const filtered = newIndex[url].filter((qid) => qid !== id);
  if (filtered.length === 0) {
    delete newIndex[url];
  } else {
    newIndex[url] = filtered;
  }
  return newIndex;
}

function removeMultipleFromUrlIndex(index, questions, questionIds) {
  let newIndex = { ...index };
  for (const qId of questionIds) {
    const q = questions[qId];
    if (q?.problemUrl && newIndex[q.problemUrl]) {
      const filtered = newIndex[q.problemUrl].filter((id) => id !== qId);
      if (filtered.length === 0) {
        delete newIndex[q.problemUrl];
      } else {
        newIndex[q.problemUrl] = filtered;
      }
    }
  }
  return newIndex;
}

export const useSheetStore = create((set, get) => ({
  sheet: null,
  topics: {},
  subTopics: {},
  questions: {},
  topicOrder: [],
  urlIndex: {},
  isLoading: false,

  loadSheet: async () => {
    set({ isLoading: true });
    try {
      const data = await mockApi.getSheet();
      set({
        sheet: data.sheet,
        topics: data.topics,
        subTopics: data.subTopics,
        questions: data.questions,
        topicOrder: data.topicOrder,
        urlIndex: buildUrlIndex(data.questions),
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false });
      toast.error('Failed to load sheet');
    }
  },

  addTopic: async (name) => {
    try {
      const topic = await mockApi.createTopic(name);
      set((s) => ({
        topics: { ...s.topics, [topic.id]: topic },
        topicOrder: [...s.topicOrder, topic.id],
      }));
    } catch (e) {
      toast.error('Failed to add topic');
    }
  },

  updateTopic: async (id, name) => {
    const prev = get().topics[id]?.name;
    set((s) => ({
      topics: {
        ...s.topics,
        [id]: { ...s.topics[id], name },
      },
    }));
    try {
      await mockApi.updateTopic(id, name);
    } catch (e) {
      set((s) => ({
        topics: {
          ...s.topics,
          [id]: { ...s.topics[id], name: prev },
        },
      }));
      toast.error('Failed to update topic');
    }
  },

  deleteTopic: async (id) => {
    const snapshot = {
      topics: { ...get().topics },
      subTopics: { ...get().subTopics },
      questions: { ...get().questions },
      topicOrder: [...get().topicOrder],
      urlIndex: get().urlIndex,
    };

    const topic = get().topics[id];
    if (!topic) return;

    const removedQuestionIds = [];
    topic.subTopicIds.forEach((stId) => {
      const st = get().subTopics[stId];
      if (st) removedQuestionIds.push(...st.questionIds);
    });

    set((s) => {
      const newSubTopics = { ...s.subTopics };
      const newQuestions = { ...s.questions };

      topic.subTopicIds.forEach((stId) => {
        const st = newSubTopics[stId];
        if (st) {
          st.questionIds.forEach((qId) => delete newQuestions[qId]);
          delete newSubTopics[stId];
        }
      });

      const newTopics = { ...s.topics };
      delete newTopics[id];

      return {
        topics: newTopics,
        subTopics: newSubTopics,
        questions: newQuestions,
        topicOrder: s.topicOrder.filter((tid) => tid !== id),
        urlIndex: removeMultipleFromUrlIndex(s.urlIndex, s.questions, removedQuestionIds),
      };
    });

    try {
      await mockApi.deleteTopic(id);
    } catch (e) {
      set(snapshot);
      toast.error('Failed to delete topic');
    }
  },

  reorderTopics: (newOrder) => {
    const prev = get().topicOrder;
    set({ topicOrder: newOrder });
    mockApi.reorderTopics(newOrder).catch(() => {
      set({ topicOrder: prev });
      toast.error('Failed to reorder topics');
    });
  },

  addSubTopic: async (topicId, name) => {
    try {
      const st = await mockApi.createSubTopic(topicId, name);
      set((s) => ({
        subTopics: { ...s.subTopics, [st.id]: st },
        topics: {
          ...s.topics,
          [topicId]: {
            ...s.topics[topicId],
            subTopicIds: [...s.topics[topicId].subTopicIds, st.id],
          },
        },
      }));
    } catch (e) {
      toast.error('Failed to add sub-topic');
    }
  },

  updateSubTopic: async (id, name) => {
    const prev = get().subTopics[id]?.name;
    set((s) => ({
      subTopics: {
        ...s.subTopics,
        [id]: { ...s.subTopics[id], name },
      },
    }));
    try {
      await mockApi.updateSubTopic(id, name);
    } catch (e) {
      set((s) => ({
        subTopics: {
          ...s.subTopics,
          [id]: { ...s.subTopics[id], name: prev },
        },
      }));
      toast.error('Failed to update sub-topic');
    }
  },

  deleteSubTopic: async (topicId, id) => {
    const snapshot = {
      topics: { ...get().topics },
      subTopics: { ...get().subTopics },
      questions: { ...get().questions },
      urlIndex: get().urlIndex,
    };

    const st = get().subTopics[id];
    const removedQuestionIds = st ? st.questionIds : [];

    set((s) => {
      const subTopic = s.subTopics[id];
      const newQuestions = { ...s.questions };
      if (subTopic) subTopic.questionIds.forEach((qId) => delete newQuestions[qId]);

      const newSubTopics = { ...s.subTopics };
      delete newSubTopics[id];

      return {
        subTopics: newSubTopics,
        questions: newQuestions,
        topics: {
          ...s.topics,
          [topicId]: {
            ...s.topics[topicId],
            subTopicIds: s.topics[topicId].subTopicIds.filter(
              (sid) => sid !== id
            ),
          },
        },
        urlIndex: removeMultipleFromUrlIndex(s.urlIndex, s.questions, removedQuestionIds),
      };
    });

    try {
      await mockApi.deleteSubTopic(topicId, id);
    } catch (e) {
      set(snapshot);
      toast.error('Failed to delete sub-topic');
    }
  },

  reorderSubTopics: (topicId, newOrder) => {
    const prev = get().topics[topicId]?.subTopicIds;
    set((s) => ({
      topics: {
        ...s.topics,
        [topicId]: {
          ...s.topics[topicId],
          subTopicIds: newOrder,
        },
      },
    }));
    mockApi.reorderSubTopics(topicId, newOrder).catch(() => {
      set((s) => ({
        topics: {
          ...s.topics,
          [topicId]: {
            ...s.topics[topicId],
            subTopicIds: prev,
          },
        },
      }));
      toast.error('Failed to reorder sub-topics');
    });
  },

  addQuestion: async (subTopicId, questionData) => {
    try {
      const q = await mockApi.createQuestion(subTopicId, questionData);
      set((s) => ({
        questions: { ...s.questions, [q.id]: q },
        subTopics: {
          ...s.subTopics,
          [subTopicId]: {
            ...s.subTopics[subTopicId],
            questionIds: [...s.subTopics[subTopicId].questionIds, q.id],
          },
        },
        urlIndex: addToUrlIndex(s.urlIndex, q.problemUrl, q.id),
      }));
    } catch (e) {
      toast.error('Failed to add question');
    }
  },

  updateQuestion: async (id, updates) => {
    const prev = get().questions[id];
    set((s) => {
      const newState = {
        questions: {
          ...s.questions,
          [id]: { ...s.questions[id], ...updates },
        },
      };

      if ('problemUrl' in updates && updates.problemUrl !== prev.problemUrl) {
        let idx = removeFromUrlIndex(s.urlIndex, prev.problemUrl, id);
        idx = addToUrlIndex(idx, updates.problemUrl, id);
        newState.urlIndex = idx;
      }

      return newState;
    });
    try {
      await mockApi.updateQuestion(id, updates);
    } catch (e) {
      set((s) => {
        const newState = {
          questions: {
            ...s.questions,
            [id]: prev,
          },
        };

        if ('problemUrl' in updates && updates.problemUrl !== prev.problemUrl) {
          let idx = removeFromUrlIndex(s.urlIndex, updates.problemUrl, id);
          idx = addToUrlIndex(idx, prev.problemUrl, id);
          newState.urlIndex = idx;
        }

        return newState;
      });
      toast.error('Failed to update question');
    }
  },

  deleteQuestion: async (subTopicId, id) => {
    const snapshot = {
      questions: { ...get().questions },
      subTopics: { ...get().subTopics },
      urlIndex: get().urlIndex,
    };

    const q = get().questions[id];

    set((s) => {
      const newQuestions = { ...s.questions };
      delete newQuestions[id];
      return {
        questions: newQuestions,
        subTopics: {
          ...s.subTopics,
          [subTopicId]: {
            ...s.subTopics[subTopicId],
            questionIds: s.subTopics[subTopicId].questionIds.filter(
              (qid) => qid !== id
            ),
          },
        },
        urlIndex: removeFromUrlIndex(s.urlIndex, q?.problemUrl, id),
      };
    });

    try {
      await mockApi.deleteQuestion(subTopicId, id);
    } catch (e) {
      set(snapshot);
      toast.error('Failed to delete question');
    }
  },

  reorderQuestions: (subTopicId, newOrder) => {
    const prev = get().subTopics[subTopicId]?.questionIds;
    set((s) => ({
      subTopics: {
        ...s.subTopics,
        [subTopicId]: {
          ...s.subTopics[subTopicId],
          questionIds: newOrder,
        },
      },
    }));
    mockApi.reorderQuestions(subTopicId, newOrder).catch(() => {
      set((s) => ({
        subTopics: {
          ...s.subTopics,
          [subTopicId]: {
            ...s.subTopics[subTopicId],
            questionIds: prev,
          },
        },
      }));
      toast.error('Failed to reorder questions');
    });
  },

  toggleSolved: (id) => {
    const prev = get().questions[id];
    if (!prev) return;

    const next = !prev.isSolved;

    set((s) => ({
      questions: {
        ...s.questions,
        [id]: { ...prev, isSolved: next },
      },
    }));

    mockApi.updateQuestion(id, { isSolved: next }).catch(() => {
      set((s) => ({
        questions: {
          ...s.questions,
          [id]: prev,
        },
      }));
      toast.error('Failed to update question');
    });
  },
}));
