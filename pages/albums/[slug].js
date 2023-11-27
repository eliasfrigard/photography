import React, { useEffect } from 'react'

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

  return `https:${modifiedSrc}?h=900&w=1200&q=25`
}

export default function ScorePage({ album, slug }) {
  console.log('🚀 || file: [slug].js:23 || ScorePage || album:', album)
  const [animate, setAnimate] = React.useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <div className='container w-full min-h-screen flex flex-col gap-4 items-center py-14'>
      <h1 className='text-6xl font-extrabold tracking-wide'>
        {album.fields.title}
      </h1>

      <div className='flex gap-6 flex-wrap'>
        <div className='flex justify-center items-center gap-3'>
          <BsCalendar2CheckFill className='text-black' />
          <Moment format='D MMMM YYYY' className='tracking-wider font-bold'>
            {album.fields.date}
          </Moment>
        </div>

        <div className='flex justify-center items-center gap-3'>
          <BsPinMapFill className='text-black' />
          <p className='tracking-wider font-bold'>
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
              <div key={image.sys.id} className={classes} style={{ transitionDelay: delay }} >
                <Image
                  loader={imageLoader}
                  alt={image.fields.title}
                  src={image.fields.file.url}
                  fill
                  sizes="(min-width: 768px) 80vw, 100vw"
                  className='object-cover hover:scale-[1.025] duration-300 cursor-pointer'
                  placeholder='blur'
                  blurDataURL={'http:' + image.fields.file.url + '?w=162&q=10'}
                />
              </div>
            )
          })
        }
      </div>
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
