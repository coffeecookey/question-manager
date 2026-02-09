import { generateId } from '@/lib/id';
import rawData from '@/data/sheet.json';

const STORAGE_KEY = 'codolio-sheet-data';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function parseSheetData() {
  const raw = rawData.data;

  const sheet = {
    id: raw.sheet._id,
    name: raw.sheet.name,
    description: raw.sheet.description,
    slug: raw.sheet.slug,
    banner: raw.sheet.banner,
  };

  const topics = {};
  const subTopics = {};
  const questions = {};
  const topicOrder = [];
  const topicNameToId = {};
  const subTopicNameToId = {};

  raw.questions.forEach((q) => {
    const topicName = q.topic;
    const subTopicName = q.subTopic;

    if (!topicNameToId[topicName]) {
      const topicId = generateId('topic');
      topicNameToId[topicName] = topicId;
      topics[topicId] = {
        id: topicId,
        name: topicName,
        subTopicIds: [],
      };
      topicOrder.push(topicId);
    }

    const topicId = topicNameToId[topicName];
    const stKey = `${topicName}::${subTopicName}`;

    if (!subTopicNameToId[stKey]) {
      const stId = generateId('st');
      subTopicNameToId[stKey] = stId;
      subTopics[stId] = {
        id: stId,
        name: subTopicName,
        questionIds: [],
      };
      topics[topicId].subTopicIds.push(stId);
    }

    const stId = subTopicNameToId[stKey];
    const qId = q._id || generateId('q');

    questions[qId] = {
      id: qId,
      title: q.title,
      questionName: q.questionId?.name || q.title,
      difficulty: q.questionId?.difficulty || 'Medium',
      platform: q.questionId?.platform || '',
      problemUrl: q.questionId?.problemUrl || '',
      resource: q.resource || '',
      topics: q.questionId?.topics || [],
      isSolved: q.isSolved || false,
    };

    subTopics[stId].questionIds.push(qId);
  });

  return { sheet, topics, subTopics, questions, topicOrder };
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function saveToStorage(d) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (_) {}
}

let data = null;

const getData = () => {
  if (!data) {
    data = loadFromStorage() || parseSheetData();
    saveToStorage(data);
  }
  return data;
};

export const mockApi = {
  getSheet: async () => {
    await delay(300);
    return structuredClone(getData());
  },

  createTopic: async (name) => {
    await delay(150);
    const d = getData();
    const id = generateId('topic');
    const topic = { id, name, subTopicIds: [] };
    d.topics[id] = topic;
    d.topicOrder.push(id);
    saveToStorage(d);
    return structuredClone(topic);
  },

  updateTopic: async (id, name) => {
    await delay(100);
    const d = getData();
    if (!d.topics[id]) throw new Error('Topic not found');
    d.topics[id].name = name;
    saveToStorage(d);
    return structuredClone(d.topics[id]);
  },

  deleteTopic: async (id) => {
    await delay(150);
    const d = getData();
    const topic = d.topics[id];
    if (!topic) return;

    topic.subTopicIds.forEach((stId) => {
      const st = d.subTopics[stId];
      if (st) {
        st.questionIds.forEach((qId) => delete d.questions[qId]);
        delete d.subTopics[stId];
      }
    });

    delete d.topics[id];
    d.topicOrder = d.topicOrder.filter((tid) => tid !== id);
    saveToStorage(d);
  },

  createSubTopic: async (topicId, name) => {
    await delay(150);
    const d = getData();
    const topic = d.topics[topicId];
    if (!topic) throw new Error('Topic not found');
    const id = generateId('st');
    const st = { id, name, questionIds: [] };
    d.subTopics[id] = st;
    topic.subTopicIds.push(id);
    saveToStorage(d);
    return structuredClone(st);
  },

  updateSubTopic: async (id, name) => {
    await delay(100);
    const d = getData();
    if (!d.subTopics[id]) throw new Error('SubTopic not found');
    d.subTopics[id].name = name;
    saveToStorage(d);
    return structuredClone(d.subTopics[id]);
  },

  deleteSubTopic: async (topicId, id) => {
    await delay(150);
    const d = getData();
    const st = d.subTopics[id];
    if (st) {
      st.questionIds.forEach((qId) => delete d.questions[qId]);
      delete d.subTopics[id];
    }
    const topic = d.topics[topicId];
    if (topic) {
      topic.subTopicIds = topic.subTopicIds.filter((sid) => sid !== id);
    }
    saveToStorage(d);
  },

  createQuestion: async (subTopicId, title) => {
    await delay(150);
    const d = getData();
    const st = d.subTopics[subTopicId];
    if (!st) throw new Error('SubTopic not found');
    const id = generateId('q');
    const q = {
      id,
      title,
      questionName: title,
      difficulty: 'Medium',
      platform: '',
      problemUrl: '',
      resource: '',
      topics: [],
      isSolved: false,
    };
    d.questions[id] = q;
    st.questionIds.push(id);
    saveToStorage(d);
    return structuredClone(q);
  },

  updateQuestion: async (id, updates) => {
    await delay(100);
    const d = getData();
    if (!d.questions[id]) throw new Error('Question not found');
    d.questions[id] = { ...d.questions[id], ...updates, id };
    saveToStorage(d);
    return structuredClone(d.questions[id]);
  },

  deleteQuestion: async (subTopicId, id) => {
    await delay(100);
    const d = getData();
    delete d.questions[id];
    const st = d.subTopics[subTopicId];
    if (st) {
      st.questionIds = st.questionIds.filter((qid) => qid !== id);
    }
    saveToStorage(d);
  },

  reorderTopics: async (newOrder) => {
    await delay(100);
    const d = getData();
    d.topicOrder = newOrder;
    saveToStorage(d);
  },

  reorderSubTopics: async (topicId, newOrder) => {
    await delay(100);
    const d = getData();
    const topic = d.topics[topicId];
    if (topic) {
      topic.subTopicIds = newOrder;
    }
    saveToStorage(d);
  },

  reorderQuestions: async (subTopicId, newOrder) => {
    await delay(100);
    const d = getData();
    const st = d.subTopics[subTopicId];
    if (st) {
      st.questionIds = newOrder;
    }
    saveToStorage(d);
  },

  resetData: async () => {
    localStorage.removeItem(STORAGE_KEY);
    data = null;
    return getData();
  },
};
