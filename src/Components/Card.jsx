import Image from "next/image";
import Link from "next/link";

const Card = ({ card }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white/70 backdrop-blur shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col ">
      {/* Image Section */}
      <div className="aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
        <Image
          src={card.image}
          alt={card.name}
          width={640}
          height={480}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full max-w-full object-contain p-4 sm:p-5 scale-100 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Section */}
      <div className="p-4 md:p-5 flex flex-col justify-between">
        {/* Title with icon */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-indigo-600 flex-shrink-0"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg md:text-xl font-semibold text-[#111827]">
            {card.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm leading-5 text-[#4b5563]">
          {card.description}
        </p>

        {/* Meta tags */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {card.meta.map((meta, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 rounded-full ${
                idx % 2 === 0
                  ? "bg-[#eef2ff] text-[#3730a3]"
                  : "bg-[#ecfeff] text-[#0369a1]"
              } px-2 py-0.5 text-[11px] font-medium`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {meta}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex-grow text-[11px] text-[#6b7280] pr-4">
            {card.description2}
          </div>
          <Link href={card.link}>
            <button className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#111827] text-white px-3 py-1.5 text-xs font-medium hover:bg-[#1f2937] transition-colors">
              Try now
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
