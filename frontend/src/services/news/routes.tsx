import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./NewsHome'))
const Latest = lazy(() => import('./NewsLatest'))
const Trending = lazy(() => import('./NewsTrending'))
const Search = lazy(() => import('./NewsSearch'))
const Bookmarks = lazy(() => import('./NewsBookmarks'))
const Category = lazy(() => import('./NewsCategory'))
const Article = lazy(() => import('./NewsArticle'))

export default function NewsRoutes() {
  return <Routes>
    <Route index element={<Home />} />
    <Route path="latest" element={<Latest />} />
    <Route path="trending" element={<Trending />} />
    <Route path="search" element={<Search />} />
    <Route path="bookmarks" element={<Bookmarks />} />
    <Route path="category/:categorySlug" element={<Category />} />
    <Route path=":slug" element={<Article />} />
    <Route path="*" element={<Navigate to="/news" replace />} />
  </Routes>
}
