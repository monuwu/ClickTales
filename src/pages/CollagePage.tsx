import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePhoto } from '../contexts/PhotoContext'
import Collage, { type CollageLayout, collageLayouts } from '../components/Collage'

const CollagePage: React.FC = () => {
  const navigate = useNavigate()
  const { photos } = usePhoto()
  const [selectedLayout, setSelectedLayout] = useState<string>(collageLayouts[0].id)

  const handleLayoutSelect = (layout: CollageLayout) => {
    setSelectedLayout(layout.id)
  }

  const handleDownload = () => {
    // You could also save the collage to the photos context here if needed
    console.log('Collage downloaded!')
  }

  const handleBack = () => {
    navigate('/camera')
  }

  // Convert photos to URLs for the collage component
  const photoUrls = photos.map(photo => photo.url)

  return (
    <Collage
      photos={photoUrls}
      selectedLayout={selectedLayout}
      onLayoutSelect={handleLayoutSelect}
      onDownload={handleDownload}
      onBack={handleBack}
    />
  )
}

export default CollagePage