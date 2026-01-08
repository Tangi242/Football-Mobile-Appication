import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext.js';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import CheckoutProgress from '../../components/ui/CheckoutProgress.js';
import LoadingButton from '../../components/ui/LoadingButton.js';
import { useToast } from '../../hooks/useToast.js';
import { placeholderImages } from '../../assets/placeholders.js';
import { onlineImages } from '../../assets/onlineImages.js';
import { lightTheme } from '../../theme/colors.js';
import EmptyState from '../../components/ui/EmptyState.js';

const CartScreen = ({ navigation }) => {
  const { theme: currentTheme } = useTheme();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, saveOrder } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const insets = useSafeAreaInsets();
  const [processing, setProcessing] = useState(false);

  const handleWhatsAppCheckout = async () => {
    if (cartItems.length === 0) {
      showError('Your cart is empty. Add items to proceed.');
      return;
    }

    setProcessing(true);

    try {
      // Format order message
      let message = 'Hello! I would like to place an order:\n\n';
      cartItems.forEach((item, index) => {
        message += `${index + 1}. ${item.productName}`;
        if (item.size) {
          message += ` (Size: ${item.size})`;
        }
        message += ` - Qty: ${item.quantity} - N$${((Number(item.price) || 0) * item.quantity).toFixed(2)}\n`;
      });
      message += `\nTotal: N$${getCartTotal().toFixed(2)}`;

      // WhatsApp number (Namibia format: +264)
      const phoneNumber = '264818055526'; // Remove leading 0 and add country code
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);

        // Save order to history if user is logged in
        if (user?.id) {
          try {
            await saveOrder(user.id.toString(), {
              items: cartItems,
              total: getCartTotal(),
              method: 'whatsapp',
            });
          } catch (error) {
            console.warn('Could not save order history:', error);
          }
        }

        showSuccess('Order sent to WhatsApp! You will receive a confirmation shortly.');
        setTimeout(() => {
          clearCart();
          navigation.goBack();
        }, 1500);
      } else {
        // Fallback to web WhatsApp
        const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        await Linking.openURL(webUrl);

        // Save order to history if user is logged in
        if (user?.id) {
          try {
            await saveOrder(user.id.toString(), {
              items: cartItems,
              total: getCartTotal(),
              method: 'whatsapp',
            });
          } catch (error) {
            console.warn('Could not save order history:', error);
          }
        }

        showSuccess('Opening WhatsApp web...');
        setTimeout(() => {
          clearCart();
          navigation.goBack();
        }, 1500);
      }
    } catch (err) {
      console.error('Error opening WhatsApp:', err);
      showError('Could not open WhatsApp. Please make sure WhatsApp is installed or try again.');
      setProcessing(false);
    }
  };

  const CartItem = ({ item }) => {
    return (
      <View style={[styles.cartItem, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
        <Image
          source={item.productImage || { uri: onlineImages.matchBanners[0] }}
          style={styles.cartItemImage}
          contentFit="cover"
        />
        <View style={styles.cartItemInfo}>
          <Text style={[styles.cartItemName, { color: currentTheme.colors.textDark }]} numberOfLines={2}>
            {item.productName}
          </Text>
          {item.size && (
            <Text style={[styles.cartItemSize, { color: currentTheme.colors.textSecondary }]}>
              Size: {item.size}
            </Text>
          )}
          <View style={styles.cartItemFooter}>
            <Text style={[styles.cartItemPrice, { color: currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C' }]}>
              N${(Number(item.price) || 0).toFixed(2)}
            </Text>
            {item.discount > 0 && item.originalPrice && (
              <Text style={[styles.cartItemOriginalPrice, { color: currentTheme.colors.muted }]}>
                N${(Number(item.originalPrice) || 0).toFixed(2)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.cartItemActions}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: currentTheme.colors.border }]}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={16} color={currentTheme.colors.textDark} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: currentTheme.colors.textDark }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: currentTheme.colors.border }]}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color={currentTheme.colors.textDark} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(item.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={[styles.container, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: currentTheme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={currentTheme.colors.textDark} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: currentTheme.colors.textDark }]}>Shopping Cart</Text>
          <View style={{ width: 24 }} />
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="cart-outline"
              messageType="cart"
              actionLabel="Browse Merchandise"
              actionIcon="storefront"
              onAction={() => navigation.navigate('Merchandise')}
              illustrationTone="red"
            />
          </View>
        ) : (
          <>
            {/* Checkout Progress Indicator */}
            <CheckoutProgress currentStep={1} steps={['Cart', 'Review', 'Payment', 'Confirmation']} />

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}

              {/* Shipping Information */}
              <View style={[styles.infoCard, { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }]}>
                <View style={styles.infoRow}>
                  <Ionicons name="car-outline" size={20} color={currentTheme.colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: currentTheme.colors.textSecondary }]}>
                      Shipping Information
                    </Text>
                    <Text style={[styles.infoValue, { color: currentTheme.colors.textDark }]}>
                      Standard shipping: N$50
                    </Text>
                    <Text style={[styles.infoSubtext, { color: currentTheme.colors.muted }]}>
                      Free shipping on orders over N$500
                    </Text>
                    {getCartTotal() < 500 && (
                      <Text style={[styles.infoHint, { color: currentTheme.colors.interactive || '#DC143C' }]}>
                        Add N${(500 - getCartTotal()).toFixed(2)} more for free shipping
                      </Text>
                    )}
                    <Text style={[styles.infoSubtext, { color: currentTheme.colors.muted, marginTop: 4 }]}>
                      Estimated delivery: 3-5 business days
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer with Total and Checkout */}
            <View style={[styles.footer, { backgroundColor: currentTheme.colors.surface, borderTopColor: currentTheme.colors.border }]}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: currentTheme.colors.textDark }]}>Total:</Text>
                <Text style={[styles.totalAmount, { color: currentTheme.colors.interactive || currentTheme.colors.error || '#DC143C' }]}>
                  N${getCartTotal().toFixed(2)}
                </Text>
              </View>
              <LoadingButton
                title="Send Order via WhatsApp"
                onPress={handleWhatsAppCheckout}
                loading={processing}
                disabled={processing}
                icon="logo-whatsapp"
                iconPosition="left"
                fullWidth
                style={styles.checkoutButton}
              />
            </View>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingBottom: lightTheme.spacing.md,
    borderBottomWidth: 1,
    ...lightTheme.shadows.sm,
    backgroundColor: lightTheme.colors.surface,
  },
  backButton: {
    padding: lightTheme.spacing.xs,
  },
  title: {
    ...lightTheme.typography.h2,
    fontWeight: '800',
  },
  scrollContent: {
    padding: lightTheme.spacing.lg,
    paddingBottom: 120, // Space for footer
  },
  cartItem: {
    flexDirection: 'row',
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 1,
    marginBottom: lightTheme.spacing.md,
    ...lightTheme.shadows.sm,
    gap: lightTheme.spacing.sm,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: lightTheme.borderRadius.sm,
    backgroundColor: lightTheme.colors.backgroundPrimary,
    flexShrink: 0,
  },
  cartItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  cartItemName: {
    ...lightTheme.typography.bodySmall,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.xs / 2,
    flexShrink: 1,
  },
  cartItemSize: {
    ...lightTheme.typography.caption,
    marginBottom: lightTheme.spacing.xs,
  },
  cartItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
  },
  cartItemPrice: {
    ...lightTheme.typography.body,
    fontWeight: '700',
  },
  cartItemOriginalPrice: {
    ...lightTheme.typography.bodySmall,
    textDecorationLine: 'line-through',
  },
  cartItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.sm,
  },
  quantityButton: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: lightTheme.borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...lightTheme.typography.bodySmall,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: lightTheme.spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: lightTheme.spacing.lg,
    borderTopWidth: 1,
    ...lightTheme.shadows.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  totalLabel: {
    ...lightTheme.typography.h3,
    fontWeight: '700',
  },
  totalAmount: {
    ...lightTheme.typography.h3,
    fontWeight: '800',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    gap: lightTheme.spacing.sm,
    ...lightTheme.shadows.md,
  },
  checkoutButtonText: {
    ...lightTheme.typography.body,
    color: lightTheme.colors.white,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: lightTheme.spacing.xl,
  },
  infoCard: {
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 1,
    marginTop: lightTheme.spacing.md,
    ...lightTheme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: lightTheme.spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...lightTheme.typography.caption,
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    ...lightTheme.typography.bodySmall,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoSubtext: {
    ...lightTheme.typography.caption,
    fontSize: 10,
    marginTop: 2,
  },
  infoHint: {
    ...lightTheme.typography.caption,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyText: {
    ...lightTheme.typography.body,
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
    textAlign: 'center',
  },
  shopButton: {
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.xl,
    borderRadius: lightTheme.borderRadius.md,
    ...lightTheme.shadows.md,
  },
  shopButtonText: {
    ...lightTheme.typography.body,
    color: lightTheme.colors.white,
    fontWeight: '700',
  },
});

export default CartScreen;

