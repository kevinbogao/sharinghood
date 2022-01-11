import { useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { useReactiveVar, ApolloError } from "@apollo/client";
import { accessTokenVar, communityIdVar } from "../pages/_app";

interface ContainerProps {
  auth?: boolean;
  community?: boolean;
  loading?: boolean;
  error?: ApolloError;
  children: ReactNode;
}

export function Container({
  auth = true,
  community = true,
  loading,
  children,
}: ContainerProps) {
  const router = useRouter();
  const acc = useReactiveVar(accessTokenVar);
  const com = useReactiveVar(communityIdVar);

  useEffect(() => {
    const accessToken = localStorage.getItem("@sharinghood:accessToken");
    const communityId = localStorage.getItem("@sharinghood:communityId");

    if (auth) {
      if (!accessToken) router.push("/login");
      else if (accessToken && community && !communityId)
        router.push("/communities");
    }
    // eslint-disable-next-line
  }, [acc, com]);

  return loading ? <Loader center color="orange" /> : <>{children}</>;
}

interface LoaderProps {
  center?: boolean;
  small?: boolean;
  color?: "red" | "green" | "orange";
}

export function Loader({ center, small, color }: LoaderProps) {
  return (
    <div className={`${center ? "center" : undefined}`}>
      <div className={`lds-ellipsis ${small ? "small" : undefined}`}>
        <div className={color ?? ""}></div>
        <div className={color ?? ""}></div>
        <div className={color ?? ""}></div>
        <div className={color ?? ""}></div>
      </div>

      <style jsx>
        {`
          @import "../pages/index.scss";

          .center {
            position: absolute;
            top: 50%;
            left: 50%;
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            z-index: 9000;
          }

          .lds-ellipsis {
            display: inline-block;
            position: relative;
            width: 80px;
            height: 13px;
          }

          .lds-ellipsis div {
            position: absolute;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: #fff;
            animation-timing-function: cubic-bezier(0, 1, 1, 0);

            &.red {
              background: rgba(176, 0, 0, 0.6);
            }

            &.green {
              background: rgba(3, 173, 0, 0.6);
            }

            &.orange {
              background: $orange;
            }
          }

          .lds-ellipsis div:nth-child(1) {
            left: 8px;
            animation: lds-ellipsis1 0.6s infinite;
          }

          .lds-ellipsis div:nth-child(2) {
            left: 8px;
            animation: lds-ellipsis2 0.6s infinite;
          }

          .lds-ellipsis div:nth-child(3) {
            left: 32px;
            animation: lds-ellipsis2 0.6s infinite;
          }

          .lds-ellipsis div:nth-child(4) {
            left: 56px;
            animation: lds-ellipsis3 0.6s infinite;
          }

          @keyframes lds-ellipsis1 {
            0% {
              transform: scale(0);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes lds-ellipsis3 {
            0% {
              transform: scale(1);
            }
            100% {
              transform: scale(0);
            }
          }

          @keyframes lds-ellipsis2 {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(24px, 0);
            }
          }

          .small {
            top: 1px;
            left: 1px;
            transform: scale(0.75);
          }
        `}
      </style>
    </div>
  );
}

export function InlineError({ text, home }: { home?: boolean; text: string }) {
  return (
    <span className="inline-error">
      {text}
      <style jsx>
        {`
          @import "../pages/index.scss";

          .inline-error {
            color: $red-200;
            max-width: ${home ? 240 : 300}px;
            display: block;
          }
        `}
      </style>
    </span>
  );
}

export type Icon =
  | "bars"
  | "user"
  | "bell"
  | "signOut"
  | "caretDown"
  | "gifts"
  | "doubleCheck"
  | "check"
  | "exclamationTriangle"
  | "clock"
  | "userClock"
  | "paperPlane"
  | "angleUp"
  | "angleDown"
  | "angleDoubleLeft"
  | "times"
  | "copy";

const SVG_MAP: Record<Icon, any> = {
  bars: {
    viewBox: "0 0 448 512",
    d: "M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z",
  },
  user: {
    viewBox: "0 0 448 512",
    d: "M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z",
  },
  bell: {
    viewBox: "0 0 448 512",
    d: "M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z",
  },
  signOut: {
    viewBox: "0 0 512 512",
    d: "M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z",
  },
  caretDown: {
    viewBox: "0 0 320 512",
    d: "M310.6 246.6l-127.1 128C176.4 380.9 168.2 384 160 384s-16.38-3.125-22.63-9.375l-127.1-128C.2244 237.5-2.516 223.7 2.438 211.8S19.07 192 32 192h255.1c12.94 0 24.62 7.781 29.58 19.75S319.8 237.5 310.6 246.6z",
  },
  gifts: {
    viewBox: "0 0 640 512",
    d: "M608 224h-20.42c2.625-7.625 4.424-15.49 4.424-23.74c0-35.5-27-72.25-72.13-72.25c-48.13 0-75.87 47.8-87.87 75.3c-12.12-27.5-39.88-75.3-87.88-75.3c-45.13 0-72.13 36.75-72.13 72.25c0 8.25 1.799 16.12 4.424 23.74H256c-17.75 0-31.1 14.25-31.1 32l-.0001 96l192-.0039V256h32v96l192 .0039l.0001-96C640 238.3 625.8 224 608 224zM335.1 224c-15.26-7.633-15.99-19.94-15.99-23.74c0-9.75 6.375-24.25 24.12-24.25c18.62 0 35.62 27.37 44.5 47.99H335.1zM528 224h-52.63c8.875-20.25 25.87-47.99 44.5-47.99c17.75 0 24.12 14.5 24.12 24.25C544 204.1 543.3 216.4 528 224zM240.6 194.1c1.875-30.88 17.25-61.25 43.1-79.87C279.4 103.5 268.8 96.01 256 96.01H226.6l30.61-21.99c7.25-5.125 9-15.12 3.75-22.25l-9.25-13c-5.125-7.25-15.12-9-22.38-3.75l-32 22.88l11.5-30.62C212 19.02 207.8 9.777 199.5 6.777l-15-5.625C176.3-1.973 167 2.277 163.9 10.53L144 63.52l-19.88-53.12c-3.125-8.25-12.38-12.5-20.62-9.375l-15 5.625C80.25 9.777 76 19.02 79.25 27.27l11.5 30.5L58.63 35.02c-7.25-5.125-17.25-3.5-22.38 3.75l-9.25 13c-5.125 7.125-3.5 17.12 3.75 22.25l30.61 21.99h-29.36c-17.75 0-32 14.25-32 31.1v351.1c0 17.75 14.25 32 32 32h168.9c-5.5-9.5-8.875-20.25-8.875-32V256C192 226.1 212.8 201 240.6 194.1zM224 480c0 17.75 14.25 32 31.1 32H416v-127.1l-192 .0039L224 480zM448 512h160c17.75 0 32-14.25 32-32L640 384l-192-.0039V512z",
  },
  doubleCheck: {
    viewBox: "0 0 512 512",
    d: "M169.4 246.6C175.6 252.9 183.8 256 192 256s16.38-3.125 22.62-9.375l160-160C380.9 80.38 384 72.19 384 64c0-18.28-14.95-32-32-32c-8.188 0-16.38 3.125-22.62 9.375L192 178.8L134.6 121.4C128.4 115.1 120.2 112 112 112c-17.05 0-32 13.73-32 32c0 8.188 3.125 16.38 9.375 22.62L169.4 246.6zM480 192c0-18.28-14.95-32-32-32c-8.188 0-16.38 3.125-22.62 9.375L192 402.8L86.63 297.4C80.38 291.1 72.19 288 64 288c-17.05 0-32 13.73-32 32c0 8.188 3.125 16.38 9.375 22.62l128 128C175.6 476.9 183.8 480 192 480s16.38-3.125 22.62-9.375l256-256C476.9 208.4 480 200.2 480 192z",
  },
  check: {
    viewBox: "0 0 512 512",
    d: "M480 128c0 8.188-3.125 16.38-9.375 22.62l-256 256C208.4 412.9 200.2 416 192 416s-16.38-3.125-22.62-9.375l-128-128C35.13 272.4 32 264.2 32 256c0-18.28 14.95-32 32-32c8.188 0 16.38 3.125 22.62 9.375L192 338.8l233.4-233.4C431.6 99.13 439.8 96 448 96C465.1 96 480 109.7 480 128z",
  },
  exclamationTriangle: {
    viewBox: "0 0 576 512",
    d: "M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z",
  },
  clock: {
    viewBox: "0 0 512 512",
    d: "M256 0C114.6 0 0 114.6 0 256c0 141.4 114.6 256 256 256c141.4 0 256-114.6 256-256C512 114.6 397.4 0 256 0zM366.8 320c-4.438 7.703-12.52 12-20.8 12c-4.078 0-8.203-1.031-11.98-3.219L244 276.8C236.6 272.5 232 264.6 232 256V120C232 106.8 242.8 96 256 96s24 10.75 24 24v122.1l78.06 45.08C369.5 293.8 373.5 308.5 366.8 320z",
  },
  userClock: {
    viewBox: "0 0 640 512",
    d: "M496 224c-79.63 0-144 64.38-144 144s64.38 144 144 144s144-64.38 144-144S575.6 224 496 224zM544 384h-54.25C484.4 384 480 379.6 480 374.3V304c0-8.836 7.164-16 16-16c8.838 0 16 7.164 16 16v48h32c8.838 0 16 7.164 16 15.1S552.8 384 544 384zM224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM320 368c0-19.3 3.221-37.82 8.961-55.2C311.9 307.2 293.6 304 274.7 304H173.3C77.61 304 0 381.7 0 477.4C0 496.5 15.52 512 34.66 512H395C349.7 480.2 320 427.6 320 368z",
  },
  paperPlane: {
    viewBox: "0 0 512 512",
    d: "M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z",
  },
  angleDoubleLeft: {
    viewBox: "0 0 448 512",
    d: "M223.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34zm-192 34l136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34z",
  },
  times: {
    viewBox: "0 0 352 512",
    d: "M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z",
  },
  angleUp: {
    viewBox: "0 0 320 512",
    d: "M177 159.7l136 136c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L160 255.9l-96.4 96.4c-9.4 9.4-24.6 9.4-33.9 0L7 329.7c-9.4-9.4-9.4-24.6 0-33.9l136-136c9.4-9.5 24.6-9.5 34-.1z",
  },
  angleDown: {
    viewBox: "0 0 320 512",
    d: "M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z",
  },
  copy: {
    viewBox: "0 0 448 512",
    d: "M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z",
  },
};

interface SVGProps {
  icon: Icon;
  className?: string;
  onClick?: () => void;
}

export function SVG({ icon, className, onClick }: SVGProps) {
  return (
    <div className={className} onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={SVG_MAP[icon].viewBox}>
        <path d={SVG_MAP[icon].d} fill="currentColor" />
      </svg>
      <style jsx>
        {`
          div {
            display: flex;
          }
        `}
      </style>
    </div>
  );
}
