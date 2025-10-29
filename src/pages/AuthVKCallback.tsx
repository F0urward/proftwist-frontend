import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthVKCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const paramsToPass = {
    code: params.get("code"),
    expires_in: params.get("expires_in"),
    device_id: params.get("device_id"),
    state: params.get("state"),
    ext_id: params.get("ext_id"),
    type: params.get("type"),
  };

  const queryString = Object.entries(paramsToPass).reduce(
    (acum, [k, v]) => acum + `&${k}=${v}`,
    "?",
  );

  useEffect(() => {
    axios
      .get(`/api/auth/vk/callback${queryString}`)
      .then((res) => {
        if (res.status === 200) {
          navigate("/");
          window.location.reload();
        }
      })
      .catch((err) => console.error("Could not authenticate"));
  }, [params]);

  return <></>;
};

export default AuthVKCallback;
