import imgRectangle from "figma:asset/1da655feaa43fea0c9238ce998bb8ead0430e3f0.png";

function Frame2() {
  return <div className="absolute h-[280px] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[140px]" style={{ left: "calc(50% + 0.5px)" }} />;
}

function Pik01031() {
  return (
    <div className="absolute content-stretch flex flex-col h-[190px] items-center justify-between overflow-clip top-[231px] w-[194px]" data-name="pik_01-03 1" style={{ left: "calc(25% - 2.75px)" }}>
      <div className="bg-[68.58%_49.44%] bg-no-repeat bg-size-[119.22%_121.76%] h-[164px] shrink-0 w-[168px]" data-name="Rectangle" style={{ backgroundImage: `url('${imgRectangle}')` }} />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute box-border content-stretch flex gap-2.5 items-center justify-center left-[77px] p-[10px] top-[421px]">
      <div className="font-['Poppins:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#090909] text-[0px] text-nowrap">
        <p className="leading-[1.35] whitespace-pre">
          <span className="text-[48px]">Parki</span>
          <span className="text-[52px]">i</span>
          <span className="text-[48px]">ng</span>
        </p>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[77px] top-[231px]">
      <Pik01031 />
      <Frame1 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents top-[231px] translate-x-[-50%]" style={{ left: "calc(50% + 0.5px)" }}>
      <Group1 />
      <div className="absolute font-['Poppins:ExtraLight',_sans-serif] leading-[0] not-italic text-[#000000] text-[22px] text-center top-[520px] translate-x-[-50%] w-52" style={{ left: "calc(50% + 0.5px)" }}>
        <p className="leading-[1.35]">{`El mapa vivo màs grande del mudo `}</p>
      </div>
    </div>
  );
}

export default function SplashV2() {
  return (
    <div className="bg-[#e9e9e9] overflow-clip relative rounded-[35px] size-full" data-name="Splash V2">
      <Frame2 />
      <Group2 />
    </div>
  );
}