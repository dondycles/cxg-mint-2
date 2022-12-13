import MorningBG from "../public/imgs/Morning/morning.webp";
import RednightBG from "../public/imgs/Rednight/rednight.webp";
import SunsetBG from "../public/imgs/Sunset/sunset.webp";
import NightBG from "../public/imgs/Night/night.webp";

import Image from "next/image";

let setLogoBgSrc;

let hours = {
    timeZone: "Africa/Accra",
    hour: "numeric",
    hour12: false,
  },
  hrsFormatter = new Intl.DateTimeFormat([], hours);

var utcHour = hrsFormatter.format(new Date());

if (utcHour == 0 || utcHour == 24) {
  setLogoBgSrc = RednightBG;
}
if (utcHour >= 1 && utcHour <= 4) {
  setLogoBgSrc = RednightBG;
}
if (utcHour >= 5 && utcHour <= 11) {
  setLogoBgSrc = MorningBG;
}
if (utcHour >= 12 && utcHour <= 17) {
  setLogoBgSrc = SunsetBG;
}
if (utcHour >= 18 && utcHour <= 23) {
  setLogoBgSrc = NightBG;
}

export default function Background() {
  return (
    <div
      className="fixed flex top-0 left-0 right-0 bottom-0 -z-10 
  "
    >
      <Image
        className="blur-sm contrast-[1.2] brightness-75 object-cover scale-[1.02]"
        src={setLogoBgSrc}
      />
    </div>
  );
}
