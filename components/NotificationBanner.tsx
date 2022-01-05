import { useState, useEffect } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { mutations } from "../lib/gql";
import { accessTokenVar } from "../pages/_app";
import { SVG } from "./Container";
import type { AddFcmTokenData, AddFcmTokenVars } from "../lib/types";

const firebaseConfig: Record<string, string> = {
  apiKey: "AIzaSyD5Qi78uPMJbZIdP4Xrso_Xgw_KkoUNIFc",
  authDomain: "sharinghood-4fded.firebaseapp.com",
  databaseURL: "https://sharinghood-4fded.firebaseio.com",
  projectId: "sharinghood-4fded",
  storageBucket: "sharinghood-4fded.appspot.com",
  messagingSenderId: "908962399001",
  appId: "1:908962399001:web:942e613c975dd1a86d7b88",
};

initializeApp(firebaseConfig);

export default function NotificationBanner() {
  const accessToken = useReactiveVar(accessTokenVar);
  const [isBannerOn, setIsBannerOn] = useState(false);

  const [addFcmToken] = useMutation<AddFcmTokenData, AddFcmTokenVars>(
    mutations.ADD_FCM_TOKEN_TO_USER
  );

  useEffect(() => {
    (async () => {
      const supported = await isSupported();
      if (accessToken && supported && Notification.permission === "default")
        setIsBannerOn(true);

      if (accessToken && supported && Notification.permission === "granted") {
        const messaging = getMessaging();
        try {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY!,
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
