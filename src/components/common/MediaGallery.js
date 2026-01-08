import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors.js';

const { width } = Dimensions.get('window');

const MediaGallery = ({ images = [], title = 'Photo Gallery' }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (!images || images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={32} color={theme.colors.muted} />
        <Text style={styles.emptyText}>No photos available</Text>
      </View>
    );
  }

  const openImage = (index) => {
    setSelectedImage(index);
    setModalVisible(true);
  };

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setSelectedImage((prev) => (prev + 1) % images.length);
    } else {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageContainer}
            onPress={() => openImage(index)}
            activeOpacity={0.9}
          >
            <Image
              source={image}
              style={styles.image}
              contentFit="cover"
              cachePolicy="disk"
            />
            {index === images.length - 1 && images.length > 3 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{images.length - 3}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          
          {selectedImage !== null && (
            <>
              <Image
                source={images[selectedImage]}
                style={styles.fullImage}
                contentFit="contain"
              />
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateImage('prev')}
                >
                  <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
                </TouchableOpacity>
                <Text style={styles.imageCounter}>
                  {selectedImage + 1} / {images.length}
                </Text>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateImage('next')}
                >
                  <Ionicons name="chevron-forward" size={24} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md
  },
  gallery: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg
  },
  imageContainer: {
    width: width * 0.4,
    height: width * 0.3,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
    ...theme.shadows.sm
  },
  image: {
    width: '100%',
    height: '100%'
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  moreText: {
    ...theme.typography.h4,
    color: theme.colors.white,
    fontWeight: '700'
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.borderRadius.full
  },
  fullImage: {
    width: width,
    height: '70%'
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg
  },
  navButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.borderRadius.full
  },
  imageCounter: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600'
  }
});

export default MediaGallery;


