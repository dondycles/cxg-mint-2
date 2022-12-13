import Image from "next/image";
import Link from "next/link";

import DcImg from "../public/imgs/Discord.png";
import TwImg from "../public/imgs/twitter.png";
import OsImg from "../public/imgs/os.png";

export default function Socmed() {
  return (
    <div
      className="
      fixed
      bottom-0
      left-0
      h-0
      md:h-full
      w-full
      md:w-0
      flex
      flex-row
      justify-center
      items-end
      gap-5
      md:items-start
      md:justify-center
      md:flex-col z-10"
    >
      <Link
        className="m-auto"
        href="https://discord.com/invite/sVsdPmFHsy"
        passHref
      >
        <a target="_blank">
          <div className=" h-[50px] w-[50px] m-auto hover:scale-[0.95] transition-all ease-in-out">
            <Image src={DcImg} />
          </div>
        </a>
      </Link>

      <Link className="m-auto" href="https://twitter.com/cxgnusnft" passHref>
        <a target="_blank">
          <div className=" h-[50px] w-[50px] m-auto hover:scale-[0.95] transition-all ease-in-out">
            <Image src={TwImg} />
          </div>
        </a>
      </Link>

      <Link
        className="m-auto"
        href="https://opensea.io/collection/cxgnus-genesis"
        passHref
      >
        <a target="_blank">
          <div className=" h-[50px] w-[50px] m-auto hover:scale-[0.95] transition-all ease-in-out">
            <Image src={OsImg} />
          </div>
        </a>
      </Link>
    </div>
  );
}
