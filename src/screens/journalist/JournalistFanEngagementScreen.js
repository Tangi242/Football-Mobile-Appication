import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.js';
import baseTheme from '../../theme/colors.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { useRefresh } from '../../context/RefreshContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPolls, createPoll, updatePoll, deletePoll, fetchQuizzes, createQuiz, updateQuiz, deleteQuiz } from '../../api/client.js';

const JournalistFanEngagementScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [activeTab, setActiveTab] = useState('Polls'); // 'Polls', 'Quizzes'
  const [polls, setPolls] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Poll form data
  const [pollData, setPollData] = useState({
    question: '',
    description: '',
    end_date: '',
    is_active: true,
    allow_multiple_votes: false,
    options: ['', '']
  });

  // Quiz form data
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'general',
    is_active: true,
    start_date: '',
    end_date: '',
    questions: [{
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    }]
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'Polls') {
        const response = await fetchPolls(user?.id);
        setPolls(response.data?.polls || []);
      } else {
        const response = await fetchQuizzes(user?.id);
        setQuizzes(response.data?.quizzes || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load ' + activeTab.toLowerCase());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleAdd = () => {
    setEditingItem(null);
    if (activeTab === 'Polls') {
      setPollData({
        question: '',
        description: '',
        end_date: '',
        is_active: true,
        allow_multiple_votes: false,
        options: ['', '']
      });
    } else {
      setQuizData({
        title: '',
        description: '',
        category: 'general',
        is_active: true,
        start_date: '',
        end_date: '',
        questions: [{
          question_text: '',
          question_type: 'multiple_choice',
          points: 1,
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        }]
      });
    }
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'Polls') {
      setPollData({
        question: item.question || '',
        description: item.description || '',
        end_date: item.end_date ? item.end_date.split('T')[0] : '',
        is_active: item.is_active !== false,
        allow_multiple_votes: item.allow_multiple_votes || false,
        options: item.options?.map(opt => opt.option_text) || ['', '']
      });
    } else {
      setQuizData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'general',
        is_active: item.is_active !== false,
        start_date: item.start_date ? item.start_date.split('T')[0] : '',
        end_date: item.end_date ? item.end_date.split('T')[0] : '',
        questions: item.questions || [{
          question_text: '',
          question_type: 'multiple_choice',
          points: 1,
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        }]
      });
    }
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete ' + activeTab.slice(0, -1),
      `Are you sure you want to delete this ${activeTab.slice(0, -1).toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (activeTab === 'Polls') {
                await deletePoll(item.id);
              } else {
                await deleteQuiz(item.id);
              }
              showSuccess(`${activeTab.slice(0, -1)} deleted successfully`);
              loadData();
              triggerRefresh('news');
            } catch (error) {
              showError('Failed to delete ' + activeTab.slice(0, -1).toLowerCase());
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (activeTab === 'Polls') {
      if (!pollData.question.trim()) {
        showError('Poll question is required');
        return;
      }
      const validOptions = pollData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        showError('At least 2 poll options are required');
        return;
      }
    } else {
      if (!quizData.title.trim()) {
        showError('Quiz title is required');
        return;
      }
      if (quizData.questions.length === 0) {
        showError('At least one question is required');
        return;
      }
      for (const question of quizData.questions) {
        if (!question.question_text.trim()) {
          showError('All questions must have text');
          return;
        }
        const validOptions = question.options.filter(opt => opt.option_text.trim());
        if (validOptions.length < 2) {
          showError('Each question must have at least 2 options');
          return;
        }
        const hasCorrect = validOptions.some(opt => opt.is_correct);
        if (!hasCorrect) {
          showError('Each question must have at least one correct answer');
          return;
        }
      }
    }

    try {
      setSaving(true);
      const data = activeTab === 'Polls' ? {
        ...pollData,
        author_id: user?.id,
        end_date: pollData.end_date ? `${pollData.end_date}T23:59:59` : null,
        options: pollData.options.filter(opt => opt.trim())
      } : {
        ...quizData,
        author_id: user?.id,
        start_date: quizData.start_date ? `${quizData.start_date}T00:00:00` : null,
        end_date: quizData.end_date ? `${quizData.end_date}T23:59:59` : null
      };

      if (editingItem) {
        if (activeTab === 'Polls') {
          await updatePoll(editingItem.id, data);
        } else {
          await updateQuiz(editingItem.id, data);
        }
        showSuccess(`${activeTab.slice(0, -1)} updated successfully`);
      } else {
        if (activeTab === 'Polls') {
          await createPoll(data);
        } else {
          await createQuiz(data);
        }
        showSuccess(`${activeTab.slice(0, -1)} created successfully`);
      }
      setModalVisible(false);
      loadData();
      triggerRefresh('news');
    } catch (error) {
      showError(error.userMessage || `Failed to save ${activeTab.slice(0, -1).toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const addPollOption = () => {
    setPollData({ ...pollData, options: [...pollData.options, ''] });
  };

  const removePollOption = (index) => {
    if (pollData.options.length > 2) {
      const newOptions = pollData.options.filter((_, i) => i !== index);
      setPollData({ ...pollData, options: newOptions });
    }
  };

  const addQuizQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, {
        question_text: '',
        question_type: 'multiple_choice',
        points: 1,
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ]
      }]
    });
  };

  const removeQuizQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const newQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData({ ...quizData, questions: newQuestions });
    }
  };

  const addQuizOption = (questionIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options.push({ option_text: '', is_correct: false });
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const removeQuizOption = (questionIndex, optionIndex) => {
    const newQuestions = [...quizData.questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      setQuizData({ ...quizData, questions: newQuestions });
    }
  };

  const renderPollItem = ({ item }) => (
    <View style={[styles.itemCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.textDark }]} numberOfLines={2}>
            {item.question}
          </Text>
          <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
            {item.options?.length || 0} options • {item.total_votes || 0} votes
          </Text>
        </View>
        <View style={styles.itemStatus}>
          <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#10B981' : '#6B7280' }]}>
            <Text style={styles.statusText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' + '20' }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuizItem = ({ item }) => (
    <View style={[styles.itemCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.textDark }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
            {item.questions?.length || 0} questions • {item.attempts || 0} attempts
          </Text>
        </View>
        <View style={styles.itemStatus}>
          <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#10B981' : '#6B7280' }]}>
            <Text style={styles.statusText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' + '20' }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Tab Selector */}
        <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Polls' && styles.tabActive]}
            onPress={() => setActiveTab('Polls')}
          >
            <Ionicons name="radio-button-on" size={20} color={activeTab === 'Polls' ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'Polls' && styles.tabTextActive]}>Polls</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Quizzes' && styles.tabActive]}
            onPress={() => setActiveTab('Quizzes')}
          >
            <Ionicons name="help-circle" size={20} color={activeTab === 'Quizzes' ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'Quizzes' && styles.tabTextActive]}>Quizzes</Text>
          </TouchableOpacity>
        </View>

        {/* Add Button */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.textDark }]}>
            Manage {activeTab}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Create {activeTab.slice(0, -1)}</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (activeTab === 'Polls' ? polls : quizzes).length === 0 ? (
          <View style={styles.list}>
            <EmptyState
              icon={activeTab === 'Polls' ? 'radio-button-on' : 'help-circle'}
              title={`No ${activeTab.toLowerCase()} yet`}
              message={`Create your first ${activeTab.slice(0, -1).toLowerCase()} to engage with fans`}
            />
          </View>
        ) : (
          <FlatList
            data={activeTab === 'Polls' ? polls : quizzes}
            renderItem={activeTab === 'Polls' ? renderPollItem : renderQuizItem}
            keyExtractor={(item) => `item-${item.id}`}
            contentContainerStyle={styles.list}
          />
        )}

        {/* Create/Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalVisible(false)}
        >
          <ScreenWrapper>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textDark }]}>
                {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'Polls' ? (
                <>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Question *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                      value={pollData.question}
                      onChangeText={(text) => setPollData({ ...pollData, question: text })}
                      placeholder="Enter poll question"
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                      value={pollData.description}
                      onChangeText={(text) => setPollData({ ...pollData, description: text })}
                      placeholder="Optional description"
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Options *</Text>
                    {pollData.options.map((option, index) => (
                      <View key={index} style={styles.optionRow}>
                        <TextInput
                          style={[styles.input, styles.optionInput, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                          value={option}
                          onChangeText={(text) => {
                            const newOptions = [...pollData.options];
                            newOptions[index] = text;
                            setPollData({ ...pollData, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                          placeholderTextColor={theme.colors.textSecondary}
                        />
                        {pollData.options.length > 2 && (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removePollOption(index)}
                          >
                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[styles.addOptionButton, { borderColor: theme.colors.primary }]}
                      onPress={addPollOption}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                      <Text style={[styles.addOptionText, { color: theme.colors.primary }]}>Add Option</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>End Date</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                      value={pollData.end_date}
                      onChangeText={(text) => setPollData({ ...pollData, end_date: text })}
                      placeholder="YYYY-MM-DD (optional)"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={[styles.formGroup, styles.switchGroup]}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Allow Multiple Votes</Text>
                    <Switch
                      value={pollData.allow_multiple_votes}
                      onValueChange={(value) => setPollData({ ...pollData, allow_multiple_votes: value })}
                      trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                      thumbColor={pollData.allow_multiple_votes ? theme.colors.primary : '#f4f3f4'}
                    />
                  </View>

                  <View style={[styles.formGroup, styles.switchGroup]}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Active</Text>
                    <Switch
                      value={pollData.is_active}
                      onValueChange={(value) => setPollData({ ...pollData, is_active: value })}
                      trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                      thumbColor={pollData.is_active ? theme.colors.primary : '#f4f3f4'}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Title *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                      value={quizData.title}
                      onChangeText={(text) => setQuizData({ ...quizData, title: text })}
                      placeholder="Enter quiz title"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                      value={quizData.description}
                      onChangeText={(text) => setQuizData({ ...quizData, description: text })}
                      placeholder="Optional description"
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Category</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                      value={quizData.category}
                      onChangeText={(text) => setQuizData({ ...quizData, category: text })}
                      placeholder="e.g., general, football, history"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Questions *</Text>
                    {quizData.questions.map((question, qIndex) => (
                      <View key={qIndex} style={[styles.questionCard, { backgroundColor: theme.colors.backgroundPrimary, borderColor: theme.colors.border }]}>
                        <View style={styles.questionHeader}>
                          <Text style={[styles.questionNumber, { color: theme.colors.textDark }]}>Question {qIndex + 1}</Text>
                          {quizData.questions.length > 1 && (
                            <TouchableOpacity onPress={() => removeQuizQuestion(qIndex)}>
                              <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                          value={question.question_text}
                          onChangeText={(text) => {
                            const newQuestions = [...quizData.questions];
                            newQuestions[qIndex].question_text = text;
                            setQuizData({ ...quizData, questions: newQuestions });
                          }}
                          placeholder="Enter question"
                          placeholderTextColor={theme.colors.textSecondary}
                          multiline
                        />
                        <View style={styles.optionsContainer}>
                          {question.options.map((option, oIndex) => (
                            <View key={oIndex} style={styles.quizOptionRow}>
                              <TextInput
                                style={[styles.input, styles.optionInput, { backgroundColor: theme.colors.surface, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                                value={option.option_text}
                                onChangeText={(text) => {
                                  const newQuestions = [...quizData.questions];
                                  newQuestions[qIndex].options[oIndex].option_text = text;
                                  setQuizData({ ...quizData, questions: newQuestions });
                                }}
                                placeholder={`Option ${oIndex + 1}`}
                                placeholderTextColor={theme.colors.textSecondary}
                              />
                              <TouchableOpacity
                                style={[styles.correctButton, { backgroundColor: option.is_correct ? '#10B981' : theme.colors.backgroundPrimary, borderColor: option.is_correct ? '#10B981' : theme.colors.border }]}
                                onPress={() => {
                                  const newQuestions = [...quizData.questions];
                                  newQuestions[qIndex].options[oIndex].is_correct = !option.is_correct;
                                  setQuizData({ ...quizData, questions: newQuestions });
                                }}
                              >
                                <Ionicons name={option.is_correct ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={option.is_correct ? '#FFFFFF' : theme.colors.textSecondary} />
                              </TouchableOpacity>
                              {question.options.length > 2 && (
                                <TouchableOpacity onPress={() => removeQuizOption(qIndex, oIndex)}>
                                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                              )}
                            </View>
                          ))}
                          <TouchableOpacity
                            style={[styles.addOptionButton, { borderColor: theme.colors.primary }]}
                            onPress={() => addQuizOption(qIndex)}
                          >
                            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.addOptionText, { color: theme.colors.primary }]}>Add Option</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.pointsInput}>
                          <Text style={[styles.label, { color: theme.colors.textDark }]}>Points:</Text>
                          <TextInput
                            style={[styles.input, styles.pointsInputField, { backgroundColor: theme.colors.surface, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                            value={String(question.points || 1)}
                            onChangeText={(text) => {
                              const newQuestions = [...quizData.questions];
                              newQuestions[qIndex].points = parseInt(text) || 1;
                              setQuizData({ ...quizData, questions: newQuestions });
                            }}
                            keyboardType="numeric"
                            placeholder="1"
                            placeholderTextColor={theme.colors.textSecondary}
                          />
                        </View>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[styles.addQuestionButton, { borderColor: theme.colors.primary }]}
                      onPress={addQuizQuestion}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                      <Text style={[styles.addOptionText, { color: theme.colors.primary }]}>Add Question</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Start Date</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                      value={quizData.start_date}
                      onChangeText={(text) => setQuizData({ ...quizData, start_date: text })}
                      placeholder="YYYY-MM-DD (optional)"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>End Date</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.backgroundPrimary, color: theme.colors.textDark, borderColor: theme.colors.border }]}
                      value={quizData.end_date}
                      onChangeText={(text) => setQuizData({ ...quizData, end_date: text })}
                      placeholder="YYYY-MM-DD (optional)"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={[styles.formGroup, styles.switchGroup]}>
                    <Text style={[styles.label, { color: theme.colors.textDark }]}>Active</Text>
                    <Switch
                      value={quizData.is_active}
                      onValueChange={(value) => setQuizData({ ...quizData, is_active: value })}
                      trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                      thumbColor={quizData.is_active ? theme.colors.primary : '#f4f3f4'}
                    />
                  </View>
                </>
              )}

              <LoadingButton
                title={editingItem ? 'Update' : 'Create'}
                onPress={handleSave}
                loading={saving}
                style={styles.saveButton}
              />
            </ScrollView>
          </ScreenWrapper>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseTheme.colors.backgroundPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: baseTheme.spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.md,
    gap: baseTheme.spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: baseTheme.colors.primary,
  },
  tabText: {
    ...baseTheme.typography.body,
    color: baseTheme.colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: baseTheme.colors.primary,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    backgroundColor: baseTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.xs,
  },
  addButtonText: {
    ...baseTheme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    padding: baseTheme.spacing.md,
  },
  itemCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    marginBottom: baseTheme.spacing.md,
    borderWidth: 1,
    ...baseTheme.shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: baseTheme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...baseTheme.typography.h4,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  itemMeta: {
    ...baseTheme.typography.bodySmall,
    fontSize: 12,
  },
  itemStatus: {
    marginLeft: baseTheme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: baseTheme.spacing.xs / 2,
    borderRadius: baseTheme.borderRadius.sm,
  },
  statusText: {
    ...baseTheme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  itemActions: {
    flexDirection: 'row',
    gap: baseTheme.spacing.sm,
    marginTop: baseTheme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.xs,
  },
  actionText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: baseTheme.spacing.md,
  },
  formGroup: {
    marginBottom: baseTheme.spacing.lg,
  },
  label: {
    ...baseTheme.typography.body,
    fontWeight: '600',
    marginBottom: baseTheme.spacing.xs,
  },
  input: {
    ...baseTheme.typography.body,
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.sm,
  },
  optionInput: {
    flex: 1,
  },
  removeButton: {
    padding: baseTheme.spacing.xs,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: baseTheme.spacing.xs,
    marginTop: baseTheme.spacing.sm,
  },
  addOptionText: {
    ...baseTheme.typography.body,
    fontWeight: '600',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCard: {
    padding: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    marginBottom: baseTheme.spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: baseTheme.spacing.sm,
  },
  questionNumber: {
    ...baseTheme.typography.body,
    fontWeight: '700',
  },
  optionsContainer: {
    marginTop: baseTheme.spacing.sm,
  },
  quizOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.sm,
  },
  correctButton: {
    padding: baseTheme.spacing.xs,
    borderRadius: baseTheme.borderRadius.sm,
    borderWidth: 1,
  },
  pointsInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    marginTop: baseTheme.spacing.sm,
  },
  pointsInputField: {
    width: 60,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: baseTheme.spacing.xs,
    marginTop: baseTheme.spacing.sm,
  },
  saveButton: {
    marginTop: baseTheme.spacing.lg,
    marginBottom: baseTheme.spacing.xl,
  },
});

export default JournalistFanEngagementScreen;

