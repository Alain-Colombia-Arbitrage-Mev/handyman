import imgRectangle from "figma:asset/663f67df35bf0d260bada512ba9e439dc5435bf8.png";

function Parkiing3DConOvalo() {
  return (
    <div className="absolute h-[118px] overflow-clip top-1/2 translate-x-[-50%] translate-y-[-50%] w-[260px]" data-name="parkiing_3d_con_ovalo" style={{ left: "calc(50% + 0.5px)" }}>
      <div className="absolute inset-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector"></g>
        </svg>
      </div>
      <div className="absolute bg-no-repeat bg-size-[100%_100%] bg-top-left inset-[9.69%_8.56%_21.95%_8.17%]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle}')` }} />
    </div>
  );
}

export default function SplashV1() {
  return (
    <div className="bg-[#e9e9e9] overflow-clip relative rounded-[35px] size-full" data-name="Splash V1">
      <Parkiing3DConOvalo />
    </div>
  );
}