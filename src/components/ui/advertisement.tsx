
interface AdvertisementProps {
  ad: string | undefined | null;
  link?: string | undefined | null;
  className?: string;
}

const Advertisement = ({ ad, link, className }: AdvertisementProps) => {
  if (!ad) return null;

  if (link) {
    return (
      <a href={link} target="_blank" rel="noreferrer" className={className} style={{ backgroundImage: `url(${ad})` }}></a>
    )
  }

  return <div className={className} style={{ backgroundImage: `url(${ad})` }}></div>
}

export default Advertisement;
