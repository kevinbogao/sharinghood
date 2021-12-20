import { useState, useEffect } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { types } from "../lib/types";
import { mutations } from "../lib/gql";
import { accessTokenVar } from "../pages/_app";
import { SVG } from "./Container";

const firebaseConfig: Record<string, string> = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_APP_ID!,
};

initializeApp(firebaseConfig);

export default function NotificationBanner() {
  const accessToken = useReactiveVar(accessTokenVar);
  const [isBannerOn, setIsBannerOn] = useState(false);

  const [addFcmToken] = useMutation<
    types.AddFcmTokenData,
    types.AddFcmTokenVars
  >(mutations.ADD_FCM_TOKEN_TO_USER);

  useEffect(() => {
    (async () => {
      const supported = await isSupported();
      if (accessToken && supported && Notification.permission === "default")
        setIsBannerOn(true);

      if (accessToken && supported && Notification.permission === "granted") {
        const messaging = getMessaging();
        try {
          const token = await getToken(messaging, {
            vapidKey:
              "BI41SUqran3nYbIK-xay6w2sq2ZLiYtfQ8u4R9kuJT1ziFywcMW3G8iJ3FtU6P9v1ER6OY8a_dSutM3AZHO9B1Q",
          });
          if (token) addFcmToken({ variables: { fcmToken: token } });
        } catch (err) {
          console.error(err);
        }
      }
    })();
    // eslint-disable-next-line
  }, [accessToken, isBannerOn]);

  return isBannerOn ? (
    <div className="request-notification">
      <p>
        Sharinghood needs your permission to{" "}
        <span
          role="presentation"
          onClick={async () => {
            await Notification.requestPermission();
            setIsBannerOn(false);
          }}
        >
          enable desktop notifications
        </span>
      </p>
      <SVG
        className="times-icon"
        icon="times"
        onClick={() => setIsBannerOn(false)}
      />
      <style jsx global>
        {`
          .times-icon {
            color: #fff;
            width: 10px;
            right: 15px;
            cursor: pointer;
            position: absolute;
          }
        `}
      </style>
    </div>
  ) : (
    <></>
  );
}
