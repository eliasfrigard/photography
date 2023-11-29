import React, { useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { getPlaiceholder } from 'plaiceholder'

import '../../app/globals.css'
import Image from "next/image"
import Moment from 'react-moment'

import { BsCalendar2CheckFill, BsPinMapFill, BsXLg, BsShareFill, BsCloudDownloadFill } from "react-icons/bs"

import { createClient } from 'contentful'

const space = process.env.SPACE_ID || ''
const accessToken = process.env.ACCESS_TOKEN || ''

const contentful = createClient({ space, accessToken })

const imageLoader = ({ src, width, quality }) => {
  let modifiedSrc = src.replace("downloads", "images");

  return `https:${modifiedSrc}?h=900&w=${width}&q=${quality}`
}

const fullImageLoader = ({ src, width, quality }) => {
  let modifiedSrc = src.replace("downloads", "images");

  return `https:${modifiedSrc}?w=${width}&q=${quality}`
}

export default function ScorePage({ album, slug, images }) {
  const [animate, setAnimate] = React.useState(false)
  const [ratio, setRatio] = React.useState('1/1')
  const [loading, setLoading] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState(album.fields.images[0])
  const [open, setOpen] = React.useState(false)

  const handleLeftArrow = React.useCallback(() => {
    const currentIndex = images.indexOf(selectedImage)
    const newIndex = currentIndex - 1

    if (newIndex >= 0) {
      setSelectedImage(images[newIndex])
    }
  }, [images, selectedImage])

  const handleRightArrow = React.useCallback(() => {
    const currentIndex = images.indexOf(selectedImage)
    const newIndex = currentIndex + 1

    if (newIndex < images.length) {
      setSelectedImage(images[newIndex])
    }
  }, [images, selectedImage])

  const handleKeyPress = React.useCallback((event) => {
    if (!open) return

    switch (event.key) {
      case 'ArrowLeft':
        handleLeftArrow()
        break
      case 'ArrowRight':
        handleRightArrow()
        break
      default:
        break
    }
  }, [open, handleLeftArrow, handleRightArrow])

  const handleImageOpen = (imageIndex) => {
    setSelectedImage(images[imageIndex])
    setOpen(true)
  }

  const handleCloseModal = () => {
    setOpen(false)
  }

  useEffect(() => {
    setAnimate(true)

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [setAnimate, handleKeyPress])

  useEffect(() => {
    setLoading(true)
  }, [selectedImage])

  useEffect(() => {
    const fileHeight = selectedImage.fields.file.details.image.height
    const fileWidth = selectedImage.fields.file.details.image.width

    setRatio(fileWidth / fileHeight)
  }, [selectedImage])

  return (
    <div className='container text-center w-full min-h-screen flex flex-col gap-4 items-center py-14'>
      <h1 className='text-4xl md:text-6xl font-extrabold tracking-wide leading-snug break-normal'>
        {album.fields.title}
      </h1>

      <div className='flex gap-6 flex-wrap text-center items-center justify-center'>
        <div className='flex justify-center items-center gap-3'>
          <BsCalendar2CheckFill className='text-black' />
          <Moment format='D MMMM YYYY' className='tracking-wider font-medium'>
            {album.fields.date}
          </Moment>
        </div>

        <div className='flex justify-center items-center gap-3'>
          <BsPinMapFill className='text-black' />
          <p className='tracking-wider font-medium'>
            {album.fields.location}
          </p>
        </div>
      </div>

      <div className='mt-10 w-full h-full grid grid-cols-3 gap-4'>
        {
          images.map((image, index) => {
            const delay = `${index * 200}ms`

            const classes = `relative w-full aspect-square rounded-lg overflow-hidden shadow-lg duration-[600ms] ${animate ? 'opacity-100' : 'opacity-0'} ease-in`

            return (
              <div onClick={() => handleImageOpen(index)} key={image.sys.id} className={classes} style={{ transitionDelay: delay }} >
                <Image
                  loader={imageLoader}
                  alt={image.fields.title}
                  src={image.fields.file.url}
                  fill
                  sizes="(min-width: 768px) 80vw, 100vw"
                  className='object-cover hover:scale-[1.025] duration-300 cursor-pointer'
                  placeholder={image?.blur ? 'blur' : 'empty'}
                  blurDataURL={image?.blur}
                  quality={25}
                />
              </div>
            )
          })
        }
      </div>

      <Dialog
        open={open}
        onClose={handleCloseModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur" aria-hidden="true" />

        <div className="fixed inset-0 flex w-screen items-center justify-center py-4 px-4 md:py-10 md:px-16">
          <Dialog.Panel className={`${loading ? 'animate-pulse' : 'animate-none'} rounded-lg relative max-h-full overflow-hidden flex justify-center items-center shadow-xl`} style={{ aspectRatio: ratio }}>
            <Image
              priority
              loader={fullImageLoader}
              onLoad={() => setLoading(false)}
              className={`w-full`}
              alt={selectedImage.fields.title}
              src={selectedImage.fields.file.url}
              quality={75}
              height={selectedImage.fields.file.details.image.height}
              width={selectedImage.fields.file.details.image.width}
              placeholder={selectedImage?.blur ? 'blur' : 'empty'}
              blurDataURL={selectedImage?.blur}
            />

            {
              !loading && (
                <div className='absolute top-5 right-5 flex text-white text-2xl gap-5 p-3 bg-neutral-900 rounded-lg opacity-100 hover:opacity-100 duration-300 bg-opacity-90'>
                  <BsCloudDownloadFill />
                  <BsShareFill />
                  <BsXLg />
                </div>
              )
            }
          </Dialog.Panel>
        </div>
      </Dialog>
    </div >
  )
}

export async function getStaticPaths() {
  const albumRes = await contentful.getEntries({
    content_type: 'photoAlbum',
  })

  const paths = albumRes?.items.map(a => {
    return {
      params: {
        slug: a.fields.title.toLowerCase().replace(' ', '-')
      }
    }
  })

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params: { slug } }) {
  const albumRes = await contentful.getEntries({
    content_type: 'photoAlbum',
  })

  const album = albumRes?.items.find(a => a.fields.title.toLowerCase().replace(' ', '-') === slug)

  const images = []

  if (process.env.NODE_ENV !== 'development') {
    for (const image of album.fields.images) {
      const src = 'https:' + image.fields.file.url

      const buffer = await fetch(src).then(async (res) =>
        Buffer.from(await res.arrayBuffer())
      )

      const { base64 } = await getPlaiceholder(buffer)

      images.push({
        ...image,
        blur: base64
      })
    }
  }

  return {
    props: {
      slug,
      album,
      images: images.length > 0 ? images : album.fields.images,
    },
  }
}
