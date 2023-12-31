import Image from "next/image"
import Moment from "react-moment"
import Link from "next/link"

const imageLoader = ({ src, width, quality }) => {
  let modifiedSrc = src.replace("downloads", "images");

  return `${modifiedSrc}?h=900&w=1200&q=25`
}

export function Album({ title, imageUrl, date }) {
  return (
    <Link href={'albums/' + title.toLowerCase().replace(' ', '-')} className="relative w-full aspect-3/4 items-end justify-center overflow-hidden text-center rounded-2xl hover:scale-105 active:scale-100 duration-[250ms] cursor-pointer tracking-wider leading-loose shadow-lg">
      <Image
        loader={imageLoader}
        alt="ALT TEXT"
        src={imageUrl}
        fill
        sizes="(min-width: 768px) 80vw, 100vw"
        className={`object-cover -z-10`}
      />

      <div className="w-full h-full flex flex-col justify-end gap-2 items-center text-center px-8 py-12 bg-neutral-900 bg-opacity-40 hover:bg-opacity-20 duration-[250ms]">
        <p className="text-3xl tracking-[2px] leading-normal text-white font-extrabold">{title}</p>
        <Moment format='D MMMM YYYY' className="tracking-wider leading-normal text-white font-bold text-lg">{date}</Moment>
        <p className="text-white font-light italic">Meilahti, Helsinki (FI)</p>
      </div>
    </Link>
  )
}

export default Album
