import React, { useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { getPlaiceholder } from 'plaiceholder'
import { Spinner } from "@material-tailwind/react";

import '../../app/globals.css'
import Image from "next/image"
import Moment from 'react-moment'

import { BsCalendar2CheckFill, BsPinMapFill } from "react-icons/bs"

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

  const handleImageOpen = (imageIndex) => {
    setSelectedImage(images[imageIndex])
    setOpen(true)
  }

  const handleCloseModal = (imageIndex) => {
    setOpen(false)
  }

  useEffect(() => {
    setAnimate(true)
  }, [])

  useEffect(() => {
    setLoading(true)
    const fileHeight = selectedImage.fields.file.details.image.height
    const fileWidth = selectedImage.fields.file.details.image.width
    setRatio(fileWidth / fileHeight)
  }, [selectedImage])

  return (
    <div className='container text-center w-full min-h-screen flex flex-col gap-4 items-center py-14'>
      <h1 className='text-6xl font-extrabold tracking-wide leading-[4.5rem]'>
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

            const classes = `relative w-full aspect-3/4 rounded-lg overflow-hidden shadow-lg duration-[600ms] ${animate ? 'opacity-100' : 'opacity-0'} ease-in`

            return (
              <div onClick={() => handleImageOpen(index)} key={image.sys.id} className={classes} style={{ transitionDelay: delay }} >
                <Image
                  loader={imageLoader}
                  alt={image.fields.title}
                  src={image.fields.file.url}
                  fill
                  sizes="(min-width: 768px) 80vw, 100vw"
                  className='object-cover hover:scale-[1.025] duration-300 cursor-pointer'
                  placeholder='blur'
                  blurDataURL={image.blur}
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

        <div className="fixed inset-0 flex w-screen items-center justify-center py-12 px-24">
          <Dialog.Panel className={`${loading ? 'animate-pulse' : 'animate-none'} rounded-lg relative h-full overflow-hidden flex justify-center items-center`} style={{ aspectRatio: ratio }}>
            <Image
              alt="nature"
              fill
              quality={75}
              loader={fullImageLoader}
              className={`object-fit h-[48rem] w-full object-center`}
              src={selectedImage.fields.file.url}
              placeholder='blur'
              onLoad={() => setLoading(false)}
              blurDataURL={selectedImage.blur}
            />
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

  return {
    props: {
      slug,
      album,
      images,
    },
  }
}
