import { create } from 'zustand';
import { mockApi } from '@/api/mock-api';
import { toast } from 'sonner';

export const useSheetStore = create((set, get) => ({
  sheet: null,
  topics: {},
  subTopics: {},
  questions: {},
  topicOrder: [],
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
    };

    const topic = get().topics[id];
    if (!topic) return;

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
    };

    set((s) => {
      const st = s.subTopics[id];
      const newQuestions = { ...s.questions };
      if (st) st.questionIds.forEach((qId) => delete newQuestions[qId]);

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

  addQuestion: async (subTopicId, title) => {
    try {
      const q = await mockApi.createQuestion(subTopicId, title);
      set((s) => ({
        questions: { ...s.questions, [q.id]: q },
        subTopics: {
          ...s.subTopics,
          [subTopicId]: {
            ...s.subTopics[subTopicId],
            questionIds: [...s.subTopics[subTopicId].questionIds, q.id],
          },
        },
      }));
    } catch (e) {
      toast.error('Failed to add question');
    }
  },

  updateQuestion: async (id, updates) => {
    const prev = get().questions[id];
    set((s) => ({
      questions: {
        ...s.questions,
        [id]: { ...s.questions[id], ...updates },
      },
    }));
    try {
      await mockApi.updateQuestion(id, updates);
    } catch (e) {
      set((s) => ({
        questions: {
          ...s.questions,
          [id]: prev,
        },
      }));
      toast.error('Failed to update question');
    }
  },

  deleteQuestion: async (subTopicId, id) => {
    const snapshot = {
      questions: { ...get().questions },
      subTopics: { ...get().subTopics },
    };

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
