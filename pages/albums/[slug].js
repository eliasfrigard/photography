import React, { useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'

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

export default function ScorePage({ album, slug }) {
  const [animate, setAnimate] = React.useState(false)
  const [ratio, setRatio] = React.useState('1/1')
  const [selectedImage, setSelectedImage] = React.useState(album.fields.images[0])

  const [open, setOpen] = React.useState(false)

  const handleImageOpen = (imageIndex) => {
    setSelectedImage(album.fields.images[imageIndex])
    setOpen(true)
  }

  const handleCloseModal = (imageIndex) => {
    setOpen(false)
  }

  useEffect(() => {
    setAnimate(true)
  }, [])

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
          album.fields.images.map((image, index) => {
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
                  blurDataURL={'http:' + image.fields.file.url + '?w=162&q=10'}
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
          <Dialog.Panel className="rounded-lg relative h-full overflow-hidden" style={{ aspectRatio: ratio }}>
            <Image
              alt="nature"
              fill
              quality={75}
              loader={fullImageLoader}
              className="object-fit h-[48rem] w-full object-center"
              src={selectedImage.fields.file.url}
              onLoad={(e) => {
                setRatio(e.target.naturalWidth / e.target.naturalHeight)
              }}
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

  return {
    props: {
      slug,
      album,
    },
  }
}
