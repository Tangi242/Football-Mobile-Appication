import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, ActivityIndicator, useWindowDimensions, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext.js';
import { t } from '../../i18n/locales.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.js';
import EmptyState from '../../components/ui/EmptyState.js';
import { usePressAnimation } from '../../hooks/usePressAnimation.js';
import baseTheme from '../../theme/colors.js';
import { placeholderImages } from '../../assets/placeholders.js';
import { onlineImages } from '../../assets/onlineImages.js';
import { useCart } from '../../context/CartContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../hooks/useToast.js';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { fetchProducts } from '../../api/client.js';
import { nfaImages } from '../../constants/media.js';

// Default placeholder image for products
const DEFAULT_PRODUCT_IMAGE = { uri: 'https://via.placeholder.com/300x300?text=Image+Not+Available' };

const ProductCard = ({ product, onPress, onToggleWishlist, isWishlisted, theme: currentTheme, isHorizontal = false, delay = 0, isSelected = false }) => {
  const { language } = useLanguage();
  const { scale, handlePressIn, handlePressOut } = usePressAnimation(0.97);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  // Get image source with fallback
  const imageSource = useMemo(() => {
    if (product.image) {
      return product.image;
    }
    // Try to get from onlineImages based on product name/category
    if (product.category === 'Jerseys') {
      return { uri: onlineImages.merchandise.jersey };
    }
    if (product.name.toLowerCase().includes('cap')) {
      return { uri: onlineImages.merchandise.cap };
    }
    if (product.name.toLowerCase().includes('football') || product.name.toLowerCase().includes('ball')) {
      return { uri: onlineImages.merchandise.football };
    }
    if (product.name.toLowerCase().includes('scarf')) {
      return { uri: onlineImages.merchandise.scarf };
    }
    if (product.name.toLowerCase().includes('training')) {
      return { uri: onlineImages.merchandise.trainingKit };
    }
    return DEFAULT_PRODUCT_IMAGE;
  }, [product]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale },
        ],
      }}
    >
      <TouchableOpacity
        style={[
          styles.productCard,
          isHorizontal && styles.productCardHorizontal,
          isSelected && {
            borderColor: currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C',
            borderWidth: 2,
            ...baseTheme.shadows.md
          }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Product: ${product.name}`}
        accessibilityHint="Double tap to view product details"
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
            onLoad={handleImageLoad}
            onError={handleImageError}
            transition={200}
            cachePolicy="memory-disk"
          />
          {imageError && (
            <View style={styles.imageErrorOverlay}>
              <Ionicons name="image-outline" size={24} color={currentTheme.colors.muted} />
              <Text style={[styles.imageErrorText, { color: currentTheme.colors.muted }]}>Image not available</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.wishlistButton, isWishlisted && styles.wishlistButtonActive]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            accessibilityHint="Double tap to toggle wishlist"
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={18}
              color={isWishlisted ? currentTheme.colors.white : currentTheme.colors.interactive || '#DC143C'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text
            style={styles.productName}
            numberOfLines={3}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            minimumFontSize={10}
            adjustsFontSizeToFit={false}
            ellipsizeMode="tail"
          >
            {product.name}
          </Text>
          <Text
            style={styles.productCategory}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            minimumFontSize={11}
          >
            {product.category}
          </Text>
          <View style={styles.productFooter}>
            <Text
              style={styles.productPrice}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.5}
              minimumFontSize={14}
              accessibilityLabel={`Price: N${product.price}`}
            >
              N${product.price}
            </Text>
            {product.discount && (
              <View style={styles.discountBadge}>
                <Text
                  style={styles.discountText}
                  allowFontScaling={true}
                  maxFontSizeMultiplier={1.5}
                  minimumFontSize={10}
                  accessibilityLabel={`Discount: ${product.discount} percent off`}
                >
                  -{product.discount}%
                </Text>
              </View>
            )}
          </View>
          <View style={styles.productMetaRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text
                style={styles.ratingText}
                allowFontScaling={true}
                maxFontSizeMultiplier={1.5}
                minimumFontSize={11}
                accessibilityLabel={`Rating: ${(typeof product.rating === 'number' ? product.rating.toFixed(1) : '4.5')} stars`}
              >
                {typeof product.rating === 'number' ? product.rating.toFixed(1) : '4.5'}
              </Text>
              <Text
                style={styles.ratingCount}
                allowFontScaling={true}
                maxFontSizeMultiplier={1.5}
                minimumFontSize={10}
              >
                ({product.reviews || 12})
              </Text>
            </View>
            <View style={styles.stockInfo}>
              <Text
                style={[
                  styles.stockText,
                  { color: product.inStock ? (currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C') : '#EF4444' }
                ]}
                allowFontScaling={true}
                maxFontSizeMultiplier={1.5}
                minimumFontSize={11}
                accessibilityLabel={product.inStock ? `In stock: ${product.stock} available` : 'Sold out'}
              >
                {product.inStock ? `In stock (${product.stock})` : 'Sold out'}
              </Text>
              {product.inStock && product.stock < 10 && (
                <Text
                  style={styles.lowStockText}
                  allowFontScaling={true}
                  maxFontSizeMultiplier={1.5}
                  minimumFontSize={10}
                  accessibilityLabel="Low stock warning"
                >
                  Low stock
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MerchandiseScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { theme: currentTheme } = useTheme();
  const { addToCart, getCartItemCount } = useCart();
  const { showSuccess, showError } = useToast();
  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('all');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'jerseys', name: 'Jerseys', icon: 'shirt' },
    { id: 'equipment', name: 'Equipment', icon: 'football' },
    { id: 'accessories', name: 'Accessories', icon: 'watch' },
    { id: 'full_kits', name: 'Full Kits', icon: 'shirt' },
    { id: 'boots', name: 'Boots', icon: 'football-outline' }
  ];

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

  // Get product recommendations based on current product
  const getRecommendations = useMemo(() => {
    if (!selectedProduct) {
      // Show popular products when no product is selected
      return products
        .filter(p => p.inStock)
        .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
        .slice(0, 4);
    }

    // Show similar products (same category or similar price range)
    return products
      .filter(p => p.id !== selectedProduct.id && p.inStock)
      .filter(p =>
        p.category === selectedProduct.category ||
        Math.abs(p.price - selectedProduct.price) < 100
      )
      .slice(0, 4);
  }, [selectedProduct, products]);

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
      // Simulate a brief delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      addToCart(selectedProduct, selectedSize, quantity);
      showSuccess(`${selectedProduct.name} added to cart!`);

      // Close modal after a brief delay
      setTimeout(() => {
        setSelectedProduct(null);
        setAddingToCart(false);
      }, 800);
    } catch (error) {
      showError('Failed to add item to cart. Please try again.');
      setAddingToCart(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          (p.name || '').toLowerCase().includes(query) ||
          (p.category || '').toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter - handle both database format (capitalized) and filter format (lowercase)
      const productCategory = (p.category || '').toLowerCase();
      const categoryOk = selectedCategory === 'all' || productCategory === selectedCategory;

      // Size filter
      const sizeOk = selectedSizeFilter === 'all' || (p.sizes || []).includes(selectedSizeFilter);

      // Price filter - ensure price is a number
      const productPrice = typeof p.price === 'number' ? p.price : Number(p.price) || 0;
      const priceOk =
        selectedPriceFilter === 'all' ||
        (selectedPriceFilter === 'under150' && productPrice < 150) ||
        (selectedPriceFilter === '150to300' && productPrice >= 150 && productPrice <= 300) ||
        (selectedPriceFilter === 'over300' && productPrice > 300);

      return categoryOk && sizeOk && priceOk;
    });
  }, [products, selectedCategory, selectedSizeFilter, selectedPriceFilter, searchQuery]);

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ScreenWrapper scrollable={false}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        style={styles.mainScrollView}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Search Bar with Notification */}
        <View style={styles.searchHeader}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => { }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={currentTheme.colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="cart-outline" size={24} color={currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C'} />
            {getCartItemCount() > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C' }]}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Promotional Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={nfaImages.authBackground || { uri: 'https://images.unsplash.com/photo-1509248962660-e6154a7f519f?q=80&w=1932' }}
            style={styles.bannerImage}
            contentFit="cover"
          />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>SPECIAL SALE</Text>
            <Text style={styles.bannerSubtitle}>Up to 70% off on selected items</Text>
            <TouchableOpacity
              style={styles.shopNowButton}
              onPress={() => setSelectedPriceFilter('under150')}
              activeOpacity={0.8}
            >
              <Text style={styles.shopNowText}>SHOP NOW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.trustBadgeText}>100% Genuine</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="cash-outline" size={20} color="#10B981" />
            <Text style={styles.trustBadgeText}>Cash On Delivery</Text>
          </View>
        </View>

        {/* Filter Button */}
        <View style={styles.filterButtonContainer}>
          <TouchableOpacity
            style={[
              styles.thisWeekFilterButton,
              (selectedSizeFilter !== 'all' || selectedPriceFilter !== 'all') && styles.thisWeekFilterButtonActive
            ]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="filter-outline"
              size={18}
              color={(selectedSizeFilter !== 'all' || selectedPriceFilter !== 'all') ? '#FFFFFF' : (currentTheme.colors.interactive || '#DC143C')}
              style={styles.filterButtonIcon}
            />
            <Text style={[
              styles.thisWeekFilterText,
              (selectedSizeFilter !== 'all' || selectedPriceFilter !== 'all') && styles.thisWeekFilterTextActive
            ]}>
              Filters
            </Text>
            {(selectedSizeFilter !== 'all' || selectedPriceFilter !== 'all') && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {(selectedSizeFilter !== 'all' ? 1 : 0) + (selectedPriceFilter !== 'all' ? 1 : 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllProducts', { category: 'all' })}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              nestedScrollEnabled={true}
            >
              {recentlyViewed.slice(0, 5).map((item, index) => (
                <ProductCard
                  key={`recent-${item.id}`}
                  product={item}
                  onPress={() => handleProductPress(item)}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.has(item.id)}
                  theme={currentTheme}
                  isHorizontal={true}
                  delay={index * 30}
                  isSelected={selectedProduct?.id === item.id}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Products</Text>
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
              {filteredProducts.map((item, index) => (
                <View key={`product-${item.id}`} style={styles.gridItem}>
                  <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlist.has(item.id)}
                    theme={currentTheme}
                    isHorizontal={false}
                    delay={index * 30}
                    isSelected={selectedProduct?.id === item.id}
                  />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="cart-outline"
              title="No products found"
              subtitle="No products found matching your filters. Try adjusting your search criteria."
              messageType="default"
              illustrationTone="brand"
            />
          )}
        </View>
      </ScrollView>

      {/* Product Modal */}
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
                    <Text style={[styles.modalPrice, { color: currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C' }]}>
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

                  {/* Size Selection */}
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
                                ? (currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C')
                                : currentTheme.colors.backgroundPrimary,
                              borderColor: selectedSize === size
                                ? (currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C')
                                : currentTheme.colors.border,
                              borderWidth: selectedSize === size ? 2 : 1.5,
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

                  {/* Quantity Selection */}
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
                    {quantity >= selectedProduct.stock && (
                      <Text style={[styles.maxQuantityText, { color: '#EF4444' }]}>
                        Maximum quantity reached
                      </Text>
                    )}
                  </View>

                  {/* Stock Information */}
                  <View style={styles.modalSection}>
                    <View style={styles.infoRow}>
                      <Ionicons name="cube-outline" size={18} color={currentTheme.colors.textSecondary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: currentTheme.colors.textSecondary }]}>
                          Stock Available
                        </Text>
                        <Text style={[styles.infoValue, {
                          color: selectedProduct.inStock
                            ? (currentTheme.colors.interactive || '#DC143C')
                            : '#EF4444'
                        }]}>
                          {selectedProduct.inStock ? `${selectedProduct.stock} units` : 'Out of stock'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Shipping Information */}
                  <View style={styles.modalSection}>
                    <View style={styles.infoRow}>
                      <Ionicons name="car-outline" size={18} color={currentTheme.colors.textSecondary} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: currentTheme.colors.textSecondary }]}>
                          Shipping
                        </Text>
                        <Text style={[styles.infoValue, { color: currentTheme.colors.textDark }]}>
                          {selectedProduct.shippingCost === 0 || (selectedProduct.freeShippingThreshold && selectedProduct.price >= selectedProduct.freeShippingThreshold)
                            ? 'Free shipping'
                            : `N$${selectedProduct.shippingCost} shipping`}
                        </Text>
                        <Text style={[styles.infoSubtext, { color: currentTheme.colors.muted }]}>
                          Estimated delivery: {selectedProduct.shippingDays} business days
                        </Text>
                        {selectedProduct.freeShippingThreshold && selectedProduct.price < selectedProduct.freeShippingThreshold && (
                          <Text style={[styles.infoHint, { color: currentTheme.colors.interactive || '#DC143C' }]}>
                            Add N${(selectedProduct.freeShippingThreshold - selectedProduct.price).toFixed(0)} more for free shipping
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Trust Indicators */}
                  <View style={styles.trustSection}>
                    <View style={styles.trustItem}>
                      <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                      <Text style={[styles.trustText, { color: currentTheme.colors.textSecondary }]}>
                        Secure checkout
                      </Text>
                    </View>
                    <View style={styles.trustItem}>
                      <Ionicons name="return-down-back" size={16} color="#10B981" />
                      <Text style={[styles.trustText, { color: currentTheme.colors.textSecondary }]}>
                        30-day returns
                      </Text>
                    </View>
                    <View style={styles.trustItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={[styles.trustText, { color: currentTheme.colors.textSecondary }]}>
                        Official merchandise
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Add to Cart Button */}
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

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={[styles.filterModalContent, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.filterModalHeader}>
              <Text style={[styles.filterModalTitle, { color: currentTheme.colors.textDark }]}>Filter Products</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={currentTheme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalScroll} showsVerticalScrollIndicator={false}>
              {/* Size Filter */}
              <View style={styles.filterModalSection}>
                <Text style={[styles.filterModalSectionTitle, { color: currentTheme.colors.textDark }]}>Size</Text>
                <View style={styles.filterOptionsGrid}>
                  {['all', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map((size) => (
                    <TouchableOpacity
                      key={`filter-size-${size}`}
                      style={[
                        styles.filterOptionChip,
                        {
                          backgroundColor: selectedSizeFilter === size
                            ? (currentTheme.colors.interactive || '#DC143C')
                            : currentTheme.colors.backgroundPrimary,
                          borderColor: selectedSizeFilter === size
                            ? (currentTheme.colors.interactive || '#DC143C')
                            : currentTheme.colors.border,
                        }
                      ]}
                      onPress={() => setSelectedSizeFilter(size)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        {
                          color: selectedSizeFilter === size
                            ? '#FFFFFF'
                            : currentTheme.colors.textDark,
                          fontWeight: selectedSizeFilter === size ? '700' : '600'
                        }
                      ]}>
                        {size === 'all' ? 'All' : size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Filter */}
              <View style={styles.filterModalSection}>
                <Text style={[styles.filterModalSectionTitle, { color: currentTheme.colors.textDark }]}>Price</Text>
                <View style={styles.filterOptionsGrid}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'under150', label: '< 150' },
                    { id: '150to300', label: '150 - 300' },
                    { id: 'over300', label: '> 300' }
                  ].map((price) => (
                    <TouchableOpacity
                      key={`filter-price-${price.id}`}
                      style={[
                        styles.filterOptionChip,
                        {
                          backgroundColor: selectedPriceFilter === price.id
                            ? (currentTheme.colors.interactive || '#DC143C')
                            : currentTheme.colors.backgroundPrimary,
                          borderColor: selectedPriceFilter === price.id
                            ? (currentTheme.colors.interactive || '#DC143C')
                            : currentTheme.colors.border,
                        }
                      ]}
                      onPress={() => setSelectedPriceFilter(price.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        {
                          color: selectedPriceFilter === price.id
                            ? '#FFFFFF'
                            : currentTheme.colors.textDark,
                          fontWeight: selectedPriceFilter === price.id ? '700' : '600'
                        }
                      ]}>
                        {price.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Apply Filters Button */}
            <View style={styles.filterModalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedSizeFilter('all');
                  setSelectedPriceFilter('all');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.clearFiltersText, { color: currentTheme.colors.textSecondary }]}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyFiltersButton, { backgroundColor: currentTheme.colors.interactive || '#DC143C' }]}
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: baseTheme.spacing.md,
    paddingTop: baseTheme.spacing.sm,
    paddingBottom: baseTheme.spacing.xs,
    gap: baseTheme.spacing.sm,
    backgroundColor: baseTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: baseTheme.colors.backgroundPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    paddingHorizontal: baseTheme.spacing.sm,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: baseTheme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: baseTheme.colors.textDark,
    paddingVertical: baseTheme.spacing.sm,
  },
  clearButton: {
    padding: 4,
  },
  notificationButton: {
    padding: baseTheme.spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
    paddingHorizontal: baseTheme.spacing.md,
    paddingTop: baseTheme.spacing.xs,
    paddingBottom: baseTheme.spacing.xs,
    width: '100%',
    zIndex: 1,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: baseTheme.spacing.md,
    minWidth: 0,
    flexShrink: 1,
  },
  cartButton: {
    position: 'relative',
    padding: baseTheme.spacing.xs,
    marginTop: 0,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 3,
    elevation: 4,
  },
  cartBadgeText: {
    color: baseTheme.colors.white,
    fontSize: 10,
    fontWeight: '700'
  },
  title: {
    ...baseTheme.typography.h3,
    fontSize: 24,
    fontWeight: '700',
    color: baseTheme.colors.textDark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...baseTheme.typography.caption,
    fontSize: 13,
    color: baseTheme.colors.textSecondary,
    fontWeight: '500',
  },
  categories: {
    marginBottom: 0,
    paddingVertical: baseTheme.spacing.xs,
    marginTop: 0,
  },
  categoriesContent: {
    paddingHorizontal: baseTheme.spacing.md,
    gap: baseTheme.spacing.sm,
    paddingRight: baseTheme.spacing.lg,
    alignItems: 'center',
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
    ...baseTheme.shadows.sm
  },
  categoryChipActive: {
    backgroundColor: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C',
    borderColor: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C'
  },
  categoryText: {
    ...baseTheme.typography.caption,
    fontSize: 13,
    color: baseTheme.colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  categoryTextActive: {
    color: baseTheme.colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  mainScrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: baseTheme.spacing.md,
    flexGrow: 1,
    minHeight: '100%',
  },
  productsList: {
    paddingBottom: baseTheme.spacing.md
  },
  bannerContainer: {
    height: 180,
    marginHorizontal: baseTheme.spacing.md,
    marginTop: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...baseTheme.shadows.lg,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: baseTheme.spacing.lg,
    alignItems: 'flex-start',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: baseTheme.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shopNowButton: {
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
    paddingHorizontal: baseTheme.spacing.lg,
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: 8,
    ...baseTheme.shadows.md,
  },
  shopNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.md,
    backgroundColor: baseTheme.colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: baseTheme.colors.border,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: baseTheme.colors.textDark,
  },
  categorySection: {
    marginBottom: baseTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: baseTheme.colors.textDark,
    paddingHorizontal: baseTheme.spacing.md,
    marginBottom: baseTheme.spacing.sm,
  },
  categoryCardsContainer: {
    paddingHorizontal: baseTheme.spacing.md,
    gap: baseTheme.spacing.sm,
  },
  categoryCard: {
    width: 90,
    height: 100,
    backgroundColor: baseTheme.colors.surface,
    borderRadius: 10,
    padding: baseTheme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: baseTheme.colors.border,
    position: 'relative',
    ...baseTheme.shadows.sm,
  },
  discountTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  discountTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryCardIcon: {
    marginBottom: baseTheme.spacing.xs / 2,
  },
  categoryCardName: {
    fontSize: 11,
    fontWeight: '600',
    color: baseTheme.colors.textDark,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: baseTheme.spacing.sm,
    paddingBottom: baseTheme.spacing.md,
  },
  gridItem: {
    width: '48%',
    margin: '1%',
  },
  filterButtonContainer: {
    paddingHorizontal: baseTheme.spacing.md,
    paddingTop: baseTheme.spacing.sm,
    paddingBottom: baseTheme.spacing.sm,
    marginBottom: 0,
    marginTop: 0,
  },
  thisWeekFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.sm,
    paddingHorizontal: baseTheme.spacing.lg,
    borderRadius: baseTheme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C',
    backgroundColor: baseTheme.colors.backgroundPrimary,
    alignSelf: 'flex-start',
    gap: baseTheme.spacing.xs,
  },
  thisWeekFilterButtonActive: {
    backgroundColor: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C',
    borderColor: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C',
  },
  filterButtonIcon: {
    marginRight: 0,
  },
  thisWeekFilterText: {
    ...baseTheme.typography.bodySmall,
    fontSize: 14,
    fontWeight: '600',
    color: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C',
  },
  thisWeekFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: baseTheme.colors.interactive || '#DC143C',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: baseTheme.colors.interactive || '#DC143C',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    borderTopLeftRadius: baseTheme.borderRadius.xl,
    borderTopRightRadius: baseTheme.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: baseTheme.spacing.sm,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: baseTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: baseTheme.colors.border,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterModalScroll: {
    paddingHorizontal: baseTheme.spacing.lg,
    paddingTop: baseTheme.spacing.md,
  },
  filterModalSection: {
    marginBottom: baseTheme.spacing.xl,
  },
  filterModalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.md,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.sm,
  },
  filterOptionChip: {
    paddingHorizontal: baseTheme.spacing.md,
    paddingVertical: baseTheme.spacing.sm,
    borderRadius: baseTheme.borderRadius.full,
    borderWidth: 1.5,
    minHeight: 40,
  },
  filterOptionText: {
    fontSize: 14,
  },
  filterModalFooter: {
    flexDirection: 'row',
    padding: baseTheme.spacing.lg,
    gap: baseTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: baseTheme.colors.border,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: baseTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: baseTheme.colors.border,
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 2,
    paddingVertical: baseTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseTheme.borderRadius.md,
    ...baseTheme.shadows.md,
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.xs
  },
  filterChip: {
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: 8,
    borderRadius: baseTheme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: baseTheme.colors.border,
    backgroundColor: baseTheme.colors.backgroundPrimary,
    minHeight: 36,
    marginRight: baseTheme.spacing.xs,
  },
  filterChipActive: {
    backgroundColor: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C',
    borderColor: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C'
  },
  filterChipText: {
    ...baseTheme.typography.caption,
    fontSize: 12,
    color: baseTheme.colors.textDark,
    fontWeight: '600'
  },
  filterChipTextActive: {
    color: baseTheme.colors.white
  },
  row: {
    justifyContent: 'space-between',
    gap: baseTheme.spacing.sm
  },
  productCard: {
    width: '100%',
    backgroundColor: baseTheme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: baseTheme.colors.border,
    ...baseTheme.shadows.sm,
    marginBottom: 0,
    minHeight: 280,
    flexDirection: 'column',
  },
  productCardHorizontal: {
    width: 160,
    marginRight: baseTheme.spacing.xs,
    marginBottom: baseTheme.spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: baseTheme.colors.backgroundPrimary,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: baseTheme.colors.backgroundPrimary
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: baseTheme.colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: baseTheme.colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    padding: baseTheme.spacing.xs,
    paddingTop: 40,
  },
  imageErrorText: {
    ...baseTheme.typography.caption,
    fontSize: 9,
    marginTop: baseTheme.spacing.xs / 2,
    textAlign: 'center',
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
    borderWidth: 2,
    borderColor: 'rgba(220, 20, 60, 0.3)',
    elevation: 5,
  },
  wishlistButtonActive: {
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
    borderColor: baseTheme.colors.interactive || '#DC143C',
  },
  productInfo: {
    padding: baseTheme.spacing.sm,
    paddingTop: baseTheme.spacing.xs,
    flex: 1,
    minHeight: 0,
  },
  productName: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600',
    color: baseTheme.colors.textDark,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    flexShrink: 1,
  },
  productCategory: {
    ...baseTheme.typography.tiny,
    color: baseTheme.colors.muted,
    fontSize: 9,
    marginBottom: 2
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: baseTheme.spacing.xs / 2,
    gap: baseTheme.spacing.xs / 2,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: baseTheme.spacing.xs / 2,
    gap: baseTheme.spacing.xs / 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  ratingText: {
    ...baseTheme.typography.caption,
    color: baseTheme.colors.textDark,
    fontWeight: '700',
    fontSize: 10
  },
  ratingCount: {
    ...baseTheme.typography.caption,
    color: baseTheme.colors.textSecondary,
    fontSize: 9
  },
  stockText: {
    ...baseTheme.typography.caption,
    fontWeight: '700',
    fontSize: 11
  },
  productPrice: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '700',
    fontSize: 13,
    color: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C'
  },
  discountBadge: {
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: baseTheme.borderRadius.sm,
    ...baseTheme.shadows.sm
  },
  discountText: {
    ...baseTheme.typography.tiny,
    color: baseTheme.colors.white,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: baseTheme.borderRadius.xl,
    borderTopRightRadius: baseTheme.borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: baseTheme.spacing.sm
  },
  modalClose: {
    position: 'absolute',
    top: baseTheme.spacing.md,
    right: baseTheme.spacing.md,
    zIndex: 10,
    padding: baseTheme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: baseTheme.borderRadius.full,
    ...baseTheme.shadows.sm
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: baseTheme.colors.backgroundPrimary,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    backgroundColor: baseTheme.colors.backgroundPrimary
  },
  modalScroll: {
    paddingHorizontal: baseTheme.spacing.lg,
    paddingTop: baseTheme.spacing.md
  },
  modalTitle: {
    ...baseTheme.typography.h3,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.xs
  },
  modalCategory: {
    ...baseTheme.typography.bodySmall,
    marginBottom: baseTheme.spacing.md
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.lg
  },
  modalPrice: {
    ...baseTheme.typography.h3,
    fontWeight: '700'
  },
  modalOriginalPrice: {
    ...baseTheme.typography.body,
    textDecorationLine: 'line-through'
  },
  modalDiscountBadge: {
    backgroundColor: baseTheme.colors.interactive || '#DC143C',
    paddingHorizontal: baseTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: baseTheme.borderRadius.sm,
    ...baseTheme.shadows.sm
  },
  modalDiscountText: {
    ...baseTheme.typography.tiny,
    color: baseTheme.colors.white,
    fontWeight: '700'
  },
  modalSection: {
    marginBottom: baseTheme.spacing.lg
  },
  modalSectionTitle: {
    ...baseTheme.typography.body,
    fontWeight: '700',
    marginBottom: baseTheme.spacing.sm
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.sm
  },
  sizeButton: {
    minWidth: 50,
    minHeight: 44, // Ensure proper touch target
    paddingVertical: baseTheme.spacing.sm,
    paddingHorizontal: baseTheme.spacing.md,
    borderRadius: baseTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sizeButtonText: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '600'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.md
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: baseTheme.borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityText: {
    ...baseTheme.typography.h4,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center'
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
    ...baseTheme.shadows.md
  },
  addToCartText: {
    ...baseTheme.typography.body,
    color: baseTheme.colors.white,
    fontWeight: '700'
  },
  section: {
    marginBottom: baseTheme.spacing.xs,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: baseTheme.spacing.md,
  },
  sectionTitle: {
    ...baseTheme.typography.h4,
    color: baseTheme.colors.textDark,
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: baseTheme.spacing.md,
    marginBottom: 4,
  },
  seeAllText: {
    ...baseTheme.typography.bodySmall,
    color: baseTheme.colors.interactive || baseTheme.colors.error || '#DC143C',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: baseTheme.spacing.md,
    paddingRight: baseTheme.spacing.md,
    gap: baseTheme.spacing.xs,
    paddingBottom: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: baseTheme.spacing.md,
    gap: baseTheme.spacing.sm,
    paddingBottom: baseTheme.spacing.lg,
    paddingTop: baseTheme.spacing.xs,
  },
  productsGridLandscape: {
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '48%',
  },
  emptyState: {
    padding: baseTheme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  emptyStateText: {
    ...baseTheme.typography.body,
    color: baseTheme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  stockInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  lowStockText: {
    ...baseTheme.typography.tiny,
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 9,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: baseTheme.spacing.sm,
    marginBottom: baseTheme.spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...baseTheme.typography.caption,
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    ...baseTheme.typography.bodySmall,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoSubtext: {
    ...baseTheme.typography.caption,
    fontSize: 10,
    marginTop: 2,
  },
  infoHint: {
    ...baseTheme.typography.caption,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  maxQuantityText: {
    ...baseTheme.typography.caption,
    fontSize: 11,
    marginTop: baseTheme.spacing.xs / 2,
    fontStyle: 'italic',
  },
  trustSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTheme.spacing.md,
    marginTop: baseTheme.spacing.md,
    paddingTop: baseTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: baseTheme.colors.border,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.spacing.xs / 2,
    flex: 1,
    minWidth: '30%',
  },
  trustText: {
    ...baseTheme.typography.caption,
    fontSize: 10,
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

export default MerchandiseScreen;