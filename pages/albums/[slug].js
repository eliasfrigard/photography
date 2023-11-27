import '../../app/globals.css'
import Image from "next/image"
import Moment from 'react-moment'

import { createClient } from 'contentful'

const space = process.env.SPACE_ID || ''
const accessToken = process.env.ACCESS_TOKEN || ''

const contentful = createClient({ space, accessToken })

const imageLoader = ({ src, width, quality }) => {
  let modifiedSrc = src.replace("downloads", "images");

  return `https:${modifiedSrc}?h=900&w=1200&q=25`
}

export default function ScorePage({ album, slug }) {
  return (
    <div className='container w-full min-h-screen flex flex-col gap-3 items-center py-14'>
      <h1 className='text-5xl font-extrabold tracking-wide'>
        {album.fields.title}
      </h1>
      <Moment format='D MMMM YYYY' className='text-lg tracking-wider font-bold'>
        {album.fields.date}
      </Moment>

      <div className='mt-8 w-full h-full grid grid-cols-3 gap-4'>
        {
          album.fields.images.map(image => (
            <div key={image.sys.id} className='relative w-full aspect-3/4 rounded-lg overflow-hidden'>
              <Image
                loader={imageLoader}
                alt={image.fields.title}
                src={image.fields.file.url}
                fill
                sizes="(min-width: 768px) 80vw, 100vw"
                className='object-cover'
                placeholder='blur'
                blurDataURL={'http:' + image.fields.file.url + '?w=162&q=10'}
              />
            </div>
          ))
        }
      </div>
    </div>
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
