import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({ link }) => {
  const pathName = usePathname();

  return (
    <Link
      href={link.url}
      className={`flex items-center gap-2 rounded p-1 transition-colors ${
        pathName === link.url
          ? "text-[#283953] font-semibold"
          : "text-gray-600 hover:text-[#283953]"
      }`}
    >
      <Image
        src="/logo.jpg"
        alt={link.title}
        width={24}
        height={24}
        className="rounded-sm"
      />
      {link.title}
    </Link>
  );
};

export default NavLink;
