import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { commerceProductById } from './commerceData'
import CommerceProductCard from './CommerceProductCard'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

export default function CommerceWishlist() {
  const store = useCommerceStore()
  const wishlistedProducts = store.wishlist.map(commerceProductById).filter((product) => product !== null)

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <div className="commerce-page-head">
          <h1>Wishlist</h1>
          <p>{wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'product saved' : 'products saved'} for later.</p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="commerce-wishlist-empty">
            <Heart aria-hidden="true" />
            <h2>Your wishlist is empty</h2>
            <p>Save products you like and find them here later.</p>
            <Link to="/commerce/products">Discover products</Link>
          </div>
        ) : (
          <div className="commerce-cards">
            {wishlistedProducts.map((product) => (
              <CommerceProductCard
                key={product.id}
                product={product}
                wishlisted={store.wishlist.includes(product.id)}
                onToggleWishlist={store.toggleWishlist}
                onAddToCart={(productId, variantId) => store.addToCart(productId, variantId, 1)}
              />
            ))}
          </div>
        )}
      </div>
    </CommerceShell>
  )
}