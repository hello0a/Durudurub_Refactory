import React from 'react'
import Layout from '../common/Layout'

import { HeroSection } from '../components/home/HeroSection'
import { CategorySection } from '../components/home/CategorySection'
import { AdBanner } from '../components/home/AdBanner'
import { useNavigate } from 'react-router-dom'

// 기존 홈
const Home = () => {

  const navigate = useNavigate()

  const handleCategoryClick = (category: string) => {
    console.log(category)
    navigate(`/explore?category=${encodeURIComponent(category)}`)
  }

  const handleMoreClick = () => {
    console.log("더보기 클릭")
    navigate('/explore')
  }

  const handleExploreClick = () => {
    console.log("모임 둘러보기")
    navigate('/explore')
  }

  return (
    <Layout>
      <HeroSection onExploreClick={handleExploreClick} />
      <AdBanner />
      <CategorySection
        onCategoryClick={handleCategoryClick}
        onMoreClick={handleMoreClick}
      />
    </Layout>
  )
}

export default Home