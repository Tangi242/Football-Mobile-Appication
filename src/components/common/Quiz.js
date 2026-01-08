import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';

const Quiz = ({ quiz, onSubmit }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (questionId, answerId) => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    setScore(correct);
    setSubmitted(true);
    
    if (onSubmit) {
      onSubmit(quiz.id, { answers: selectedAnswers, score: correct, total: quiz.questions.length });
    }
  };

  const allAnswered = quiz.questions.every(q => selectedAnswers[q.id] !== undefined);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="school-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.title}>Football Quiz</Text>
      </View>
      <Text style={styles.quizTitle}>{quiz.title}</Text>
      <Text style={styles.quizDescription}>{quiz.description}</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.questionsContainer}>
        {quiz.questions.map((question, qIndex) => {
          const selected = selectedAnswers[question.id];
          const isCorrect = submitted && selected === question.correctAnswer;
          const isWrong = submitted && selected && selected !== question.correctAnswer;

          return (
            <View key={question.id} style={styles.questionCard}>
              <Text style={styles.questionText}>
                {qIndex + 1}. {question.question}
              </Text>
              <View style={styles.options}>
                {question.options.map((option) => {
                  const isSelected = selected === option.id;
                  const isCorrectAnswer = submitted && option.id === question.correctAnswer;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.option,
                        isSelected && styles.optionSelected,
                        isCorrectAnswer && styles.optionCorrect,
                        isWrong && isSelected && styles.optionWrong
                      ]}
                      onPress={() => handleAnswerSelect(question.id, option.id)}
                      disabled={submitted}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        isCorrectAnswer && styles.optionTextCorrect
                      ]}>
                        {option.text}
                      </Text>
                      {isCorrectAnswer && submitted && (
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      )}
                      {isWrong && isSelected && (
                        <Ionicons name="close-circle" size={16} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {!submitted ? (
        <TouchableOpacity
          style={[styles.submitButton, !allAnswered && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered}
          activeOpacity={0.7}
        >
          <Text style={styles.submitText}>Submit Answers</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Ionicons name="trophy" size={32} color="#F59E0B" />
            <Text style={styles.scoreText}>Your Score</Text>
            <Text style={styles.scoreValue}>
              {score} / {quiz.questions.length}
            </Text>
            <Text style={styles.scorePercentage}>
              {((score / quiz.questions.length) * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm
  },
  title: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  quizTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs
  },
  quizDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md
  },
  questionsContainer: {
    maxHeight: 400,
    marginBottom: theme.spacing.md
  },
  questionCard: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  questionText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm
  },
  options: {
    gap: theme.spacing.xs
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundPrimary
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10'
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981' + '20'
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444' + '20'
  },
  optionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textDark,
    flex: 1
  },
  optionTextSelected: {
    fontWeight: '600',
    color: theme.colors.primary
  },
  optionTextCorrect: {
    color: '#10B981',
    fontWeight: '700'
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.muted,
    opacity: 0.5
  },
  submitText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700'
  },
  resultsContainer: {
    marginTop: theme.spacing.md
  },
  scoreCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundPrimary,
    borderRadius: theme.borderRadius.md
  },
  scoreText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm
  },
  scoreValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: '800',
    marginVertical: theme.spacing.xs
  },
  scorePercentage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600'
  }
});

export default Quiz;


