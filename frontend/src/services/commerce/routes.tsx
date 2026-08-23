import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./CommerceHome'))
const Categories = lazy(() => import('./CommerceCategories'))
const Products = lazy(() => import('./CommerceProducts'))
const ProductDetail = lazy(() => import('./CommerceProductDetail'))
const Cart = lazy(() => import('./CommerceCart'))
const Checkout = lazy(() => import('./CommerceCheckout'))
const Wishlist = lazy(() => import('./CommerceWishlist'))
const Offers = lazy(() => import('./CommerceOffers'))
const Brands = lazy(() => import('./CommerceBrands'))
const Search = lazy(() => import('./CommerceSearch'))

export default function CommerceRoutes() {
  return <Routes>
    <Route index element={<Home />} />
    <Route path="categories" element={<Categories />} />
    <Route path="products" element={<Products />} />
    <Route path="product/:slug" element={<ProductDetail />} />
    <Route path="cart" element={<Cart />} />
    <Route path="checkout" element={<Checkout />} />
    <Route path="wishlist" element={<Wishlist />} />
    <Route path="offers" element={<Offers />} />
    <Route path="brands" element={<Brands />} />
    <Route path="search" element={<Search />} />
    <Route path="*" element={<Navigate to="/commerce" replace />} />
  </Routes>
}
