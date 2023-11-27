import React, { useRef, useEffect, useState } from 'react'

import '../../app/globals.css'
import Image from "next/image"
import Moment from 'react-moment'

import { createClient } from 'contentful'

const space = process.env.SPACE_ID || ''
const accessToken = process.env.ACCESS_TOKEN || ''

const contentful = createClient({ space, accessToken })

const ImageWithAspectRatio = ({ image }) => {
  const divRef = useRef(null);
  const [divWidth, setDivWidth] = useState(null);

  useEffect(() => {
    const updateDivWidth = () => {
      if (divRef.current) {
        const width = divRef.current.getBoundingClientRect().width;
        setDivWidth(width);
      }
    };

    // Update the width initially and whenever the window is resized
    updateDivWidth();
    window.addEventListener('resize', updateDivWidth);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', updateDivWidth);
    };
  }, []); // Empty dependency array means this effect runs once after the initial render

  const calculatedHeight = divWidth ? divWidth * aspectRatio : 'auto';

  return (
    <div key={image.sys.id} className={`relative h-[${calculatedHeight}px]`} ref={divRef}>
      {divWidth && (
        <Image
          alt={image.fields.title}
          src={'https:' + image.fields.file.url}
          fill
          sizes={`(min-width: 768px) ${divWidth}px, 100vw`}
          className={`object-cover`}
        />
      )}
    </div>
  );
};

export default function ScorePage({ album, slug }) {
  return (
    <div className='container w-full min-h-screen flex flex-col gap-2 items-center py-16'>
      <h1 className='text-5xl font-extrabold tracking-wide'>
        {album.fields.title}
      </h1>
      <Moment format='D MMMM YYYY' className='text-lg tracking-wider font-bold'>
        {album.fields.date}
      </Moment>

      <div className='w-full h-full grid grid-cols-3 gap-2 mt-8'>
        {
          album.fields.images.map(image => (
            <ImageWithAspectRatio key={image.sys.id} image={image} />
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

  const album = albumRes?.items.find(a => a.fields.title.toLowerCase() === slug)

  return {
    props: {
      slug,
      album,
    },
  }
}
