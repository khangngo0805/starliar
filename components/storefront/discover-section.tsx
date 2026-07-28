import Image from "next/image";
import Link from "next/link";

const discoveries = [
  {
    alt: "Starlier tote bag carried at night",
    href: "/shop?category=Accessories",
    image: "/media/discover-bags.png",
    title: "Bags"
  },
  {
    alt: "Starlier shirt in an interior setting",
    href: "/shop?category=Shirt",
    image: "/media/discover-shirts.png",
    title: "Shirts"
  }
];

export function DiscoverSection() {
  return (
    <section aria-labelledby="discover-heading" className="discover-section" id="campaign">
      <h2 id="discover-heading">Discover</h2>
      <div className="discover-grid">
        {discoveries.map((discovery) => (
          <Link className="discover-card" href={discovery.href} key={discovery.title}>
            <Image alt={discovery.alt} fill sizes="(max-width: 820px) 100vw, 50vw" src={discovery.image} />
            <span className="discover-card-scrim" />
            <span className="discover-card-content">
              <span className="discover-card-title">{discovery.title}</span>
              <span className="discover-card-link">Explore {discovery.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
