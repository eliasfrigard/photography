import Album from '../components/Album'
import '../app/globals.css'

import { createClient } from 'contentful'

export async function getStaticProps() {
  const space = process.env.SPACE_ID || ''
  const accessToken = process.env.ACCESS_TOKEN || ''

  const contentful = createClient({ space, accessToken })

  const albumRes = await contentful.getEntries({
    content_type: 'photoAlbum',
    order: '-fields.date',
  })

  const albums = albumRes?.items

  return {
    props: {
      albums
    },
  }
}

export default function Albums({ albums }) {
  return (
    <div className="container min-h-screen py-16 grid grid-cols-3 gap-6">
      {
        albums.map((album) => {
          return <Album key={album.sys.id} title={album.fields.title} imageUrl={'https:' + album.fields.images[0].fields.file.url} date={album.fields.date}></Album>
        })
      }
    </div>
  )
}
