import { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext.js';
import { t } from '../../i18n/locales.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { usePressAnimation } from '../../hooks/usePressAnimation.js';
import baseTheme from '../../theme/colors.js';
import { onlineImages } from '../../assets/onlineImages.js';
import { useCart } from '../../context/CartContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { fetchProducts } from '../../api/client.js';

// Default placeholder image for products
const DEFAULT_PRODUCT_IMAGE = { uri: 'https://via.placeholder.com/300x300?text=Image+Not+Available' };

const ProductCard = ({ product, onPress, onToggleWishlist, isWishlisted, theme: currentTheme }) => {
  const { scale, handlePressIn, handlePressOut } = usePressAnimation(0.97);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const imageSource = useMemo(() => {
    if (product.image) return product.image;
    if (product.category === 'Jerseys') return { uri: onlineImages.merchandise.jersey };
    if (product.name.toLowerCase().includes('cap')) return { uri: onlineImages.merchandise.cap };
    if (product.name.toLowerCase().includes('football') || product.name.toLowerCase().includes('ball')) return { uri: onlineImages.merchandise.football };
    if (product.name.toLowerCase().includes('scarf')) return { uri: onlineImages.merchandise.scarf };
    if (product.name.toLowerCase().includes('training')) return { uri: onlineImages.merchandise.trainingKit };
    return DEFAULT_PRODUCT_IMAGE;
  }, [product]);

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        {imageLoading && !imageError && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={currentTheme.colors.interactive || '#DC143C'} />
          </View>
        )}
        <Image
          source={imageError ? DEFAULT_PRODUCT_IMAGE : imageSource}
          style={styles.productImage}
          contentFit="cover"
          onLoad={() => { setImageLoading(false); setImageError(false); }}
          onError={() => { setImageLoading(false); setImageError(true); }}
          transition={200}
          cachePolicy="memory-disk"
        />
        <TouchableOpacity
          style={[styles.wishlistButton, isWishlisted && styles.wishlistButtonActive]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={isWishlisted ? currentTheme.colors.white : currentTheme.colors.interactive || '#DC143C'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>N${product.price}</Text>
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>
        <View style={styles.productMetaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{typeof product.rating === 'number' ? product.rating.toFixed(1) : '4.5'}</Text>
          </View>
          <Text style={[styles.stockText, { color: product.inStock ? (currentTheme.colors.interactive || '#DC143C') : '#EF4444' }]}>
            {product.inStock ? 'In stock' : 'Sold out'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AllProductsScreen = ({ navigation, route }) => {
  const { language } = useLanguage();
  const { theme: currentTheme } = useTheme();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Get category from route params if available
  const initialCategory = route?.params?.category || 'all';
  useEffect(() => {
    if (initialCategory !== 'all') {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const response = await fetchProducts();
        const fetchedProducts = response.data?.products || [];
        
        // Transform products to match expected format
        const transformedProducts = fetchedProducts.map(product => ({
          ...product,
          image: product.imageUrl ? { uri: product.imageUrl } : DEFAULT_PRODUCT_IMAGE,
          sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []),
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductsError(error.userMessage || 'Failed to load products');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'jerseys', name: 'Jerseys', icon: 'shirt' },
    { id: 'accessories', name: 'Accessories', icon: 'watch' },
    { id: 'equipment', name: 'Equipment', icon: 'football' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory === 'all') return true;
      return p.category.toLowerCase() === selectedCategory;
    });
  }, [selectedCategory, products]);

  const handleProductPress = (product) => {
    addToRecentlyViewed(product);
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || null);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showError('Please select a size before adding to cart');
      return;
    }

    setAddingToCart(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      addToCart(selectedProduct, selectedSize, quantity);
      showSuccess(`${selectedProduct.name} added to cart!`);
      setTimeout(() => {
        setSelectedProduct(null);
        setAddingToCart(false);
      }, 800);
    } catch (error) {
      showError('Failed to add item to cart. Please try again.');
      setAddingToCart(false);
    }
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const numColumns = width > 600 ? 3 : 2;
  const cardWidth = (width - (baseTheme.spacing.md * 2) - (baseTheme.spacing.sm * (numColumns - 1))) / numColumns;

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon}
              size={18}
              color={selectedCategory === category.id ? currentTheme.colors.white : (currentTheme.colors.interactive || '#DC143C')}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {productsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={currentTheme.colors.interactive || '#DC143C'} />
            <Text style={[styles.loadingText, { color: currentTheme.colors.textSecondary }]}>
              Loading products...
            </Text>
          </View>
        ) : productsError ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Error loading products"
            subtitle={productsError}
            messageType="error"
            illustrationTone="brand"
          />
        ) : filteredProducts.length > 0 ? (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={[styles.gridItem, { width: cardWidth }]}>
                <ProductCard
                  product={product}
                  onPress={() => handleProductPress(product)}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.has(product.id)}
                  theme={currentTheme}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="cart-outline"
            title="No products found"
            subtitle="No products found matching your filters."
            messageType="default"
            illustrationTone="brand"
          />
        )}
      </ScrollView>

      {/* Product Modal - Same as MerchandiseScreen */}
      <Modal
        visible={selectedProduct !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.surface }]}>
            {selectedProduct && (
              <>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setSelectedProduct(null)}
                >
                  <Ionicons name="close" size={24} color={currentTheme.colors.textDark} />
                </TouchableOpacity>

                <View style={styles.modalImageContainer}>
                  <Image
                    source={selectedProduct.image || DEFAULT_PRODUCT_IMAGE}
                    style={styles.modalImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.modalTitle, { color: currentTheme.colors.textDark }]}>
                    {selectedProduct.name}
                  </Text>
                  <Text style={[styles.modalCategory, { color: currentTheme.colors.textSecondary }]}>
                    {selectedProduct.category}
                  </Text>

                  <View style={styles.modalPriceRow}>
                    <Text style={[styles.modalPrice, { color: currentTheme.colors.interactive || '#DC143C' }]}>
                      N${selectedProduct.discount
                        ? (selectedProduct.price * (1 - selectedProduct.discount / 100)).toFixed(0)
                        : selectedProduct.price}
                    </Text>
                    {selectedProduct.discount && (
                      <>
                        <Text style={[styles.modalOriginalPrice, { color: currentTheme.colors.muted }]}>
                          N${selectedProduct.price}
                        </Text>
                        <View style={styles.modalDiscountBadge}>
                          <Text style={styles.modalDiscountText}>-{selectedProduct.discount}%</Text>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: currentTheme.colors.textDark }]}>
                      Select Size
                    </Text>
                    <View style={styles.sizeContainer}>
                      {selectedProduct.sizes?.map((size) => (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.sizeButton,
                            {
                              backgroundColor: selectedSize === size
                                ? (currentTheme.colors.interactive || '#DC143C')
                                : currentTheme.colors.backgroundPrimary,
                              borderColor: selectedSize === size
                                ? (currentTheme.colors.interactive || '#DC143C')
                                : currentTheme.colors.border,
                            },
                          ]}
                          onPress={() => setSelectedSize(size)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.sizeButtonText,
                              {
                                color: selectedSize === size
                                  ? currentTheme.colors.white
                                  : currentTheme.colors.textDark,
                              },
                            ]}
                          >
                            {size}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: currentTheme.colors.textDark }]}>
                      Quantity
                    </Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={[styles.quantityButton, { borderColor: currentTheme.colors.border }]}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={20} color={currentTheme.colors.textDark} />
                      </TouchableOpacity>
                      <Text style={[styles.quantityText, { color: currentTheme.colors.textDark }]}>
                        {quantity}
                      </Text>
                      <TouchableOpacity
                        style={[styles.quantityButton, { borderColor: currentTheme.colors.border }]}
                        onPress={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                        activeOpacity={0.7}
                        disabled={quantity >= selectedProduct.stock}
                      >
                        <Ionicons
                          name="add"
                          size={20}
                          color={quantity >= selectedProduct.stock ? currentTheme.colors.muted : currentTheme.colors.textDark}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <LoadingButton
                  title="Add to Cart"
                  onPress={handleAddToCart}
                  loading={addingToCart}
                  disabled={addingToCart || !selectedSize}
                  icon="cart"
                  iconPosition="left"
                  fullWidth
                  style={styles.addToCartButton}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
    backgroundColor: baseTheme.colors.surface,
  },
  backButton: {
    padding: baseTheme.spacing.xs,
  },
  headerTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
    color: baseTheme.colors.textDark,
  },
  categories: {
    marginBottom: baseTheme.spacing.xs,
    paddingVertical: baseTheme.spacing.xs,
  },
  categoriesContent: {
    paddingHorizontal: baseTheme.spacing.md,
    gap: baseTheme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: baseTheme.spacing.md,
    borderRadius: 20,
    backgroundColor: baseTheme.colors.surface,
    borderWidth: 1.5,
    borderColor: baseTheme.colors.border,
    gap: 6,
    minHeight: 40,
  },
  categoryChipActive: {
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
    borderColor: baseTheme.colors.interactive || '#DC143C',
  },
  categoryText: {
    ...baseTheme.typography.caption,
    fontSize: 13,
    color: baseTheme.colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: baseTheme.colors.white,
    fontWeight: '700',
  },
  scrollContent: {
    padding: baseTheme.spacing.md,
    paddingBottom: baseTheme.spacing.xl,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: baseTheme.spacing.sm,
  },
  gridItem: {
    marginBottom: baseTheme.spacing.md,
  },
  productCard: {
    backgroundColor: baseTheme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: baseTheme.colors.border,
    ...baseTheme.shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: baseTheme.colors.backgroundPrimary,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: baseTheme.borderRadius.full,
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...baseTheme.shadows.lg,
    zIndex: 20,
  },
  wishlistButtonActive: {
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
  },
  productInfo: {
    padding: baseTheme.spacing.sm,
  },
  productName: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    color: baseTheme.colors.textDark,
    fontSize: 13,
    marginBottom: 4,
  },
  productCategory: {
    ...baseTheme.typography.tiny,
    color: baseTheme.colors.muted,
    fontSize: 9,
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: baseTheme.spacing.xs,
  },
  productPrice: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '700',
    fontSize: 13,
    color: baseTheme.colors.interactive || '#DC143C',
  },
  discountBadge: {
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: baseTheme.borderRadius.sm,
  },
  discountText: {
    ...baseTheme.typography.tiny,
    color: baseTheme.colors.white,
    fontWeight: '700',
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: baseTheme.spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...baseTheme.typography.caption,
    color: baseTheme.colors.textDark,
    fontWeight: '700',
    fontSize: 10,
  },
  stockText: {
    ...baseTheme.typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: baseTheme.borderRadius.xl,
    borderTopRightRadius: baseTheme.borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: baseTheme.spacing.sm,
  },
  modalClose: {
    position: 'absolute',
    top: baseTheme.spacing.md,
    right: baseTheme.spacing.md,
    zIndex: 10,
    padding: baseTheme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: baseTheme.borderRadius.full,
    ...baseTheme.shadows.sm,
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: baseTheme.colors.backgroundPrimary,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalScroll: {
    paddingHorizontal: baseTheme.spacing.lg,
    paddingTop: baseTheme.spacing.md,
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs,
  },
  modalCategory: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.md,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.lg,
  },
  modalPrice: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
  },
  modalOriginalPrice: {
    ...baseTheme.typography.body,
    textDecorationLine: 'line-through',
  },
  modalDiscountBadge: {
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: baseTheme.borderRadius.sm,
  },
  modalDiscountText: {
    ...baseTheme.typography.tiny,
    color: baseTheme.colors.white,
    fontWeight: '700',
  },
  modalSection: {
    marginBottom: baseTheme.spacing.lg,
  },
  modalSectionTitle: {
    ...baseTheme.typography.body,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.sm,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.sm,
  },
  sizeButton: {
    minWidth: 50,
    minHeight: 44,
    paddingVertical: baseTheme.spacing.sm,
    paddingHorizontal: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  sizeButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.md,
    marginHorizontal: baseTheme.spacing.lg,
    marginTop: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    gap: baseTheme.spacing.sm,
    ...baseTheme.shadows.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: baseTheme.spacing.xl * 2,
  },
  loadingText: {
    ...baseTheme.typography.body,
    marginTop: baseTheme.spacing.md,
  },
});

export default AllProductsScreen;

